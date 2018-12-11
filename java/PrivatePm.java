import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PrivatePm {
	private final String api;
	
	public PrivatePm() {
		this("https://api.privatepm.com");
	}
	
	public PrivatePm(String api) {
		this.api = api;
	}
	
	private String genKey() {
		byte[] key1 = new byte[128 / 8];
		new SecureRandom().nextBytes(key1);
		byte[] key2 = new byte[128 / 8];
		new SecureRandom().nextBytes(key2);
		byte[] key3 = new byte[128 / 8];
		new SecureRandom().nextBytes(key3);
		
		return DatatypeConverter.printHexBinary(key1) + DatatypeConverter.printHexBinary(key2) + DatatypeConverter.printHexBinary(key3);
	}
	
	private SecretKey generateKey(String salt, String passphrase) throws NoSuchAlgorithmException, InvalidKeySpecException {
		SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
		KeySpec spec = new PBEKeySpec(passphrase.toCharArray(), DatatypeConverter.parseHexBinary(salt), 1000, 128);
		return new SecretKeySpec(factory.generateSecret(spec).getEncoded(), "AES");
	}
	
	private String encrypt(String message, String key) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException, InvalidKeySpecException, InvalidAlgorithmParameterException {
		String iv = key.substring(0, 32);
		String salt = key.substring(32, 64);
		String passphrase = key.substring(64);
		
		SecretKey key2 = generateKey(salt, passphrase);
		Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
		cipher.init(Cipher.ENCRYPT_MODE, key2, new IvParameterSpec(DatatypeConverter.parseHexBinary(iv)));
		byte[] encrypted = cipher.doFinal(message.getBytes(StandardCharsets.UTF_8));
		return Base64.getEncoder().encodeToString(encrypted);
	}
	
	private String decrypt(String encrypted, String key) throws NoSuchPaddingException, NoSuchAlgorithmException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException, InvalidKeySpecException, InvalidAlgorithmParameterException {
		String iv = key.substring(0, 32);
		String salt = key.substring(32, 64);
		String passphrase = key.substring(64);
		
		SecretKey key2 = generateKey(salt, passphrase);
		Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
		cipher.init(Cipher.DECRYPT_MODE, key2, new IvParameterSpec(DatatypeConverter.parseHexBinary(iv)));
		byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encrypted.replaceAll("_", "/").replaceAll("\\.", "+").replaceAll("-", "=")));
		return new String(decrypted, StandardCharsets.UTF_8);
	}
	
	private String hash(String message) throws NoSuchAlgorithmException {
		MessageDigest digest = MessageDigest.getInstance("SHA-256");
		return DatatypeConverter.printHexBinary(digest.digest(message.getBytes(StandardCharsets.UTF_8))).toLowerCase();
	}
	
	private void storeKey(String id, String key, Long expiration) throws IOException {
		String url = this.api + "/" + id;
		if (expiration != null) {
			url += "?expiration=" + expiration;
		}
		
		HttpURLConnection connection = null;
		try {
			connection = (HttpURLConnection) new URL(url).openConnection();
			connection.setRequestMethod("PUT");
			connection.setDoOutput(true);
			
			connection.getOutputStream().write(key.getBytes(StandardCharsets.UTF_8));
			
			int responseCode = connection.getResponseCode();
			if (responseCode != 200) {
				throw new RuntimeException("Failed to storeKey. Got response code: " + responseCode);
			}
		} finally {
			if (connection != null) {
				connection.disconnect();
			}
		}
	}
	
	private static class Key {
		private Key(Long expiration, String key) {
			this.expiration = expiration;
			this.key = key;
		}
		
		final Long   expiration;
		final String key;
	}
	
	private Key getKey(String id) throws IOException {
		HttpURLConnection connection = null;
		try {
			connection = (HttpURLConnection) new URL(this.api + "/" + id).openConnection();
			connection.setRequestMethod("GET");
			
			int responseCode = connection.getResponseCode();
			if (responseCode != 200) {
				throw new RuntimeException("Failed to storeKey. Got response code: " + responseCode);
			}
			
			BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
			String inputLine;
			StringBuilder builder = new StringBuilder();
			while ((inputLine = in.readLine()) != null) {
				builder.append(inputLine);
			}
			in.close();
			
			Long expiration;
			String key;
			
			String response = builder.toString();
			
			Matcher expMatcher = Pattern.compile("\"expiration\"\\s*:\\s*(\\d+)").matcher(response);
			if (!expMatcher.find())
				throw new RuntimeException("Could not find expiration in getKey response. Got response: " + response);
			expiration = Long.parseLong(expMatcher.group(1));
			
			Matcher keyMatcher = Pattern.compile("\"key\"\\s*:\\s*\"(.+)\"").matcher(response);
			if (!keyMatcher.find())
				throw new RuntimeException("Could not find key in getKey response. Got response: " + response);
			key = keyMatcher.group(1);
			
			return new Key(expiration, key);
		} finally {
			if (connection != null) {
				connection.disconnect();
			}
		}
	}
	
	public String input(String message) {
		return input(message, null);
	}
	
	public String input(String message, Long expiration) {
		try {
			String key = genKey();
			String encrypted = encrypt(message, key);
			String hash = hash(encrypted);
			storeKey(hash, key, expiration);
			return encrypted;
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public static class Output {
		private Output(Long expiration, String message) {
			this.expiration = expiration;
			this.message = message;
		}
		
		public final Long   expiration;
		public final String message;
	}
	
	public Output output(String encrypted) {
		try {
			String hash = hash(encrypted);
			Key res = getKey(hash);
			return new Output(res.expiration, decrypt(encrypted, res.key));
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}
	
	public void destroy(String encrypted) {
		String hash = hash(encrypted);
		
		HttpURLConnection connection = null;
		try {
			connection = (HttpURLConnection) new URL(this.api + "/" + hash).openConnection();
			connection.setRequestMethod("DELETE");
			connection.setDoOutput(false);
			
			int responseCode = connection.getResponseCode();
			if (responseCode != 200) {
				throw new RuntimeException("Failed to destroy. Got response code: " + responseCode);
			}
		} finally {
			if (connection != null) {
				connection.disconnect();
			}
		}
	}
}