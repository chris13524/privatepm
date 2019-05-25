import {environment} from "../environments/environment";
import * as CryptoJS from "crypto-js";
import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";

@Injectable()
export class PrivatepmService {
  constructor(private http: HttpClient) {
  }
  
  /**
   * Generates a random encryption key.
   * @returns {string}
   */
  private genKey(): string {
    return (<any>CryptoJS.lib.WordArray.random(128 / 8)).toString(CryptoJS.enc.Hex) + (<any>CryptoJS.lib.WordArray.random(128 / 8)).toString(CryptoJS.enc.Hex) + (<any>CryptoJS.lib.WordArray.random(128 / 8)).toString(CryptoJS.enc.Hex);
  }
  
  private generateKey(salt: string, passPhrase: string) {
    return CryptoJS.PBKDF2(
      passPhrase,
      CryptoJS.enc.Hex.parse(salt),
      {keySize: 4, iterations: 1000});
  }
  
  /**
   * Encrypts the given message with the key using AES and formats the result as URL-friendly base64 encoding.
   * @param {string} message
   * @param {string} key
   * @returns {string}
   */
  private encrypt(message: string, key: string): string {
    let iv = key.substring(0, 32);
    let salt = key.substring(32, 64);
    let passPhrase = key.substring(64);
    
    let key2 = this.generateKey(salt, passPhrase);
    let encrypted = CryptoJS.AES.encrypt(
      message,
      key2,
      {iv: CryptoJS.enc.Hex.parse(iv)});
    return (<any>encrypted.ciphertext).toString(CryptoJS.enc.Base64);
  }
  
  /**
   * Decrypts the string formatted as URL-friendly base64 encoding.
   * @param {string} encrypted
   * @param {string} key
   * @returns {string}
   */
  private decrypt(encrypted: string, key: string): string {
    let iv = key.substring(0, 32);
    let salt = key.substring(32, 64);
    let passPhrase = key.substring(64);
    
    let key2 = this.generateKey(salt, passPhrase);
    let cipherParams = (<any>CryptoJS.lib).CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(encrypted
        .replace(/_/g, "/")
        .replace(/\./g, "+")
        .replace(/-/g, "="))
    });
    let decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key2,
      {iv: CryptoJS.enc.Hex.parse(iv)});
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  
  /**
   * Computes the sha256 hash of the provided message.
   * @param {string} message
   * @returns {string}
   */
  private hash(message: string): string {
    return CryptoJS.SHA256(message).toString();
  }
  
  /**
   * Stores the encryption key on the server using the provided ID.
   * @param {string} id
   * @param {string} key
   * @param expiration
   * @returns {Promise<void>}
   */
  private async storeKey(id: string, key: string, expiration?: number): Promise<void> {
    let url = environment.api + "/" + id;
    if (expiration != null) {
      url += "?expiration=" + expiration;
    }
    return this.http.put(url, key, {responseType: "text"})
      .forEach(() => {
        // cannot use toPromise() as that would result in a Promise<string> and we need a Promise<void>
        // using forEach() seems to solve the issue
      });
  }
  
  /**
   * Given an ID, returns the key stored on the server.
   * @param {string} id
   * @returns {Promise<string | -1>}
   */
  private async getKey(id: string): Promise<{ expiration: number, key: string }> {
    return this.http.get<{ expiration: number, key: string }>(environment.api + "/" + id).toPromise();
  }
  
  /**
   * Given a message, returns the message ID.
   * @param {string} message
   * @param expiration
   * @param serverSide whether to store the message server-side rather than in the returned key
   * @returns {Promise<string>}
   */
  public async input(message: string, expiration?: number, serverSide?: boolean): Promise<string> {
    let key = this.genKey();
    if (serverSide) key = "=" + key; // prefix the ID with an equals sign to indicate it was stored server side
    let encrypted = this.encrypt(message, key);
    if (serverSide) {
      await this.storeKey(this.hash(key), encrypted, expiration);
      return key;
    } else {
      await this.storeKey(this.hash(encrypted), key, expiration);
      return encrypted;
    }
  }
  
  /**
   * Given a message key, returns the message.
   * @param {string} id
   * @returns {Promise<string | -1>}
   */
  public async output(id: string): Promise<{ expiration: number, message: string }> {
    const serverSide = await this.getKey(this.hash(id));
    let decrypted;
    if (id.startsWith("=")) {
      // when storing on the server, the ID is the encryption key; decrypt the message (stored server side) with the ID
      decrypted = this.decrypt(serverSide.key, id);
    } else {
      // when storing locally, the ID is the encrypted message; decrypt it with the key stored on the server
      decrypted = this.decrypt(id, serverSide.key);
    }
    return {expiration: serverSide.expiration, message: decrypted};
  }
  
  /**
   * Given a message ID, destroy it on the server.
   * @param {string} encrypted
   * @returns {Promise<void>}
   */
  public async destroy(encrypted: string): Promise<void> {
    let id = this.hash(encrypted);
    return this.http.delete<void>(environment.api + "/" + id).toPromise();
  }
}
