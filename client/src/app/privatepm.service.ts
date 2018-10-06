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
    return CryptoJS.lib.WordArray.random(256).toString();
  }
  
  /**
   * Encrypts the given message with the key using AES and formats the result as URL-friendly base64 encoding.
   * @param {string} message
   * @param {string} key
   * @returns {string}
   */
  private encrypt(message: string, key: string): string {
    return CryptoJS.AES.encrypt(message, key)
      .toString()
      .replace(/\//g, "_")
      .replace(/\+/g, ".")
      .replace(/=/g, "-");
  }
  
  /**
   * Decrypts the string formatted as URL-friendly base64 encoding.
   * @param {string} encrypted
   * @param {string} key
   * @returns {string}
   */
  private decrypt(encrypted: string, key: string): string {
    return CryptoJS.AES.decrypt(encrypted
      .replace(/_/g, "/")
      .replace(/\./g, "+")
      .replace(/-/g, "="), key).toString(CryptoJS.enc.Utf8);
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
   * Given an ID, returns the encryption key stored on the server.
   * @param {string} id
   * @returns {Promise<string | -1>}
   */
  private async getKey(id: string): Promise<string> {
    return this.http.get<string>(environment.api + "/" + id, {responseType: <any>"text"}).toPromise();
  }
  
  /**
   * Given a message, returns the encrypted message.
   * @param {string} message
   * @param expiration
   * @returns {Promise<string>}
   */
  public async input(message: string, expiration?: number): Promise<string> {
    let key = this.genKey();
    let encrypted = this.encrypt(message, key);
    let hash = this.hash(encrypted);
    await this.storeKey(hash, key, expiration);
    return encrypted;
  }
  
  /**
   * Given an encrypted message, returns the message.
   * @param {string} encrypted
   * @returns {Promise<string | -1>}
   */
  public async output(encrypted: string): Promise<string> {
    let hash = this.hash(encrypted);
    let key = await this.getKey(hash);
    return this.decrypt(encrypted, key);
  }
}
