package com.smartgen.myteacher.service;

import android.content.Context;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.ExecutorService;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class DecryptNUnTweakFile {

    private static Socket m_socket;
    private static BufferedInputStream bis;
    private static OutputStream out;
    private static Cipher decryptionCipher;
    private ServerSocket serverSocket;
    private byte[] encryptedByteArray;
    private byte[] decryptedByteArray;
    private long offsetToReadFile = 0;
    private int chunkSizeToReadFileOffline = 102400;// set chunksize to read file
    private int chunkSizeToReadFileOnline = 51200;// set chunksize to read file
    private int validfile = 0;
    private long originalbytes;
    private String filekey = "";
    private String fileName = "";
    private int half_chunk = 0;
    private int counter = 0;
    private ExecutorService threadPool;
    private boolean requestService = false;
    private int iswmplayer = 0;
    private URL url = null;
    private InputStream is = null;
    private int chunkSizeForDecryption = 1032;
    private int chunkSizeForUnTweak = 1024;
    private int requestCounter = 0;
    private String filepath;
    String range = "";
    private Context context;

    public DecryptNUnTweakFile(Context context, ServerSocket serverSocket, Socket socket, ExecutorService threadPool) {
        this.context = context;
        this.m_socket = socket;
        this.serverSocket = serverSocket;
        this.threadPool = threadPool;

        try {
            BufferedReader in = new BufferedReader(new InputStreamReader(m_socket.getInputStream()));
            out = m_socket.getOutputStream();
            out.flush();
            String in_line = "";
            try {
                while ((in_line = in.readLine()).length() > 0) {// Loop for listen requestFile data
                    //System.out.println("in_line : " + in_line);
                    if (in_line.contains("GET /") && !in_line.contains("/crossdomain.xml")) {// condition for getting request of Content
                        fileName = in_line.substring(in_line.indexOf("GET /") + 5, in_line.indexOf("HTTP/")).trim();
                        fileName = fileName.replace("%20", " ");
                    } else if (in_line.contains("User-Agent:")) {
                        //uAgent = in_line.replace("User-Agent: ", "");
                    } else if (in_line.contains("Range:")) {// condition for getting the range of requestFile
                        range = in_line;//"Range: bytes=107937792-119953871";
                    } else if (in_line.equals("Accept: */*")) {// condition for getting the range of requestFile
                        iswmplayer++;
                    } else if (in_line.contains("gzip")) {// condition for getting the range of requestFile
                        iswmplayer++;
                    }
                }
            } catch (Exception e) {
            }


            if (fileName.equals("Service_Status")) {
                requestService = true;
                String serviceVersion = m_socket.getLocalPort() + "-<Version>PC V-1.0.0 </Version>";
                out.write(serviceVersion.getBytes());
                out.close();
                m_socket.close();
            } else if (fileName.equals("Service_Stop")) {
                requestService = true;
                out.close();
                m_socket.close();
                try {
                    threadPool.shutdown();
                    serverSocket.close();
                } catch (Exception e) {
                }
            }

            if (!requestService) {
                if (fileName.contains("http://") || fileName.contains("https://")) {
                    decryptOnlineFile();
                } else {
                    decryptOfflineFile();
                }
            }

            encryptedByteArray = null;
            decryptedByteArray = null;
            out.close();
            m_socket.close();
        } catch (Exception e) {
            try {
                this.encryptedByteArray = null;
                this.decryptedByteArray = null;
                this.out.close();
                this.m_socket.close();
                this.bis.close();
            } catch (Exception ex) {
            }
        }
    }

    private void decryptOfflineFile() {
        try {
            enc_file_key(fileName.substring(fileName.lastIndexOf("/") + 1, fileName.length()), fileName.substring(fileName.lastIndexOf("/", fileName.lastIndexOf("/") - 1) + 1, fileName.lastIndexOf("/")));
            decryptionCipher = Cipher.getInstance("DES");// create cipher for decryption
            decryptionCipher.init(Cipher.DECRYPT_MODE, new SecretKeySpec(filekey.getBytes(), "DES"));
//                fileName = ContentPath.SetContentpath + fileName.replace("/", "\\").replaceAll("%20", " ");
//            fileName = "/" + fileName;
            //System.out.println("fileName : " + fileName);
            byte[] lastChunkPadding_url = new byte[1];
            long len = new File(fileName).length() - 1;
            bis = new BufferedInputStream(new FileInputStream(fileName));
            bis.read(lastChunkPadding_url, 0, 1);
            int len1 = Integer.parseInt(new String(lastChunkPadding_url));
            if (chunkSizeToReadFileOffline > len) {
                chunkSizeToReadFileOffline = (int) len;
            }
            if (chunkSizeToReadFileOffline > 1032) {
                chunkSizeToReadFileOffline = chunkSizeToReadFileOffline - (chunkSizeToReadFileOffline % 1032);
            }
            long lastChunk = len % 1032;
            long totalChunks = len / 1032;
            long origLastChunk = 0;
            if (lastChunk == 0 && Integer.parseInt(new String(lastChunkPadding_url)) == 8) {// condition set orignal last chunk value is 0 while;
                lastChunk = 0;
            } else {
                origLastChunk = lastChunk - len1;// deduct len1 from lastchunk so, u got original lastchunk of requestd file
            }
            lastChunkPadding_url = null;
            originalbytes = (totalChunks * 1024) + origLastChunk;
            checkFileRange(range);
            if (len < 12000) {
                chunkSizeToReadFileOffline = (int) len;
            }
            while (offsetToReadFile < len && validfile == 0 && counter == 2) {// Loop to read file, decrypt file and untweak file in chunks while jume in video
                readAndDecryptFile();
                half_chunk = half_chunk + 11;
                int startpos = half_chunk;
                startpos--;
                int size = decryptedByteArray.length - half_chunk;
                byte[] temp_Array = new byte[size + 1];
                System.arraycopy(decryptedByteArray, startpos, temp_Array, 0, decryptedByteArray.length - startpos);
                out.write(temp_Array, 0, temp_Array.length);
                temp_Array = null;
                counter = 1;
                encryptedByteArray = null;
                decryptedByteArray = null;
                offsetToReadFile += chunkSizeToReadFileOffline;
                if ((len - offsetToReadFile) < chunkSizeToReadFileOffline) {
                    chunkSizeToReadFileOffline = (int) (len - offsetToReadFile);
                }
            }

            while (offsetToReadFile < len && validfile == 0 && counter == 0) {// Loop to read file, decrypt file and untweak file in chunks only for first chunk block
                readAndDecryptFile();
                out.write(decryptedByteArray, 10, (decryptedByteArray.length - 10));
                encryptedByteArray = null;
                decryptedByteArray = null;
                offsetToReadFile += chunkSizeToReadFileOffline;

                if ((len - offsetToReadFile) < chunkSizeToReadFileOffline) {
                    chunkSizeToReadFileOffline = (int) (len - offsetToReadFile);
                }
                counter++;
            }

            while (offsetToReadFile < len && validfile == 0 && counter == 1) {// Loop to read file, decrypt file and untweak file in chunks upto length of file
                readAndDecryptFile();
                out.write(decryptedByteArray, 0, decryptedByteArray.length);
                encryptedByteArray = null;
                decryptedByteArray = null;
                offsetToReadFile += chunkSizeToReadFileOffline;

                if ((len - offsetToReadFile) < chunkSizeToReadFileOffline) {
                    chunkSizeToReadFileOffline = (int) (len - offsetToReadFile);
                }
            }

            encryptedByteArray = null;
            decryptedByteArray = null;
            bis.close();
            out.close();
            m_socket.close();
        } catch (Exception e) {
            try {
                this.encryptedByteArray = null;
                this.decryptedByteArray = null;
                this.out.close();
                this.m_socket.close();
                this.bis.close();
            } catch (Exception ex) {
            }
        }
    }

    private void decryptOnlineFile() {
        try {
            byte[] lastChunkPadding_url = new byte[1];
            enc_file_key(fileName.substring(fileName.lastIndexOf("/") + 1, fileName.length()), fileName.substring(fileName.lastIndexOf("/", fileName.lastIndexOf("/") - 1) + 1, fileName.lastIndexOf("/")));
            decryptionCipher = Cipher.getInstance("DES");
            decryptionCipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(filekey.getBytes(), "DES"));

            filepath = fileName;

            url = new URL(filepath);
            URLConnection urlConn = url.openConnection();

//            long len = PreferenceConnector.readLong(context, PreferenceConnector.FILE_LEN, -1);
//            if (len == -1) {
            long len = urlConn.getContentLength() - 1;
//                PreferenceConnector.writeLong(context, PreferenceConnector.FILE_LEN, len);
//            registerBroadCastForResetSocket();
//            }


            is = urlConn.getInputStream();
            is.read(lastChunkPadding_url, 0, 1);
            int len1 = Integer.parseInt(new String(lastChunkPadding_url));// every
            // fileRequest
            // first
            // byte
            // is
            // integer
            // value.

            if (chunkSizeToReadFileOnline > len) {
                chunkSizeToReadFileOnline = (int) len;
            }

            if (chunkSizeToReadFileOnline > chunkSizeForDecryption) {
                chunkSizeToReadFileOnline = chunkSizeToReadFileOnline
                        - (chunkSizeToReadFileOnline % chunkSizeForDecryption);
            }

            long lastChunk = len % chunkSizeForDecryption;
            long totalChunks = len / chunkSizeForDecryption;
            long origLastChunk = 0;
            if (lastChunk == 0
                    && Integer.parseInt(new String(lastChunkPadding_url)) == 8) {// condition
                // set
                // orignal
                // last
                // chunk
                // value
                // is
                // 0
                // while;
                lastChunk = 0;
            } else {
                origLastChunk = lastChunk - len1;// deduct len1 from lastchunk
                // so, u got original
                // lastchunk of requestd
                // file
            }
            lastChunkPadding_url = null;
            originalbytes = (totalChunks * chunkSizeForUnTweak) + origLastChunk;
            checkFileRangeForServerContent(range);
            if (len < 12000) {
                chunkSizeToReadFileOnline = (int) len;
            }

            while (offsetToReadFile < len && validfile == 0
                    && requestCounter != 0) {// Loop to read file, decrypt file
                // and untweak file in chunks
                // while jume in video
                readAndDecryptFileForServerStream();
                half_chunk = half_chunk + 11;
                int startpos = half_chunk;
                startpos--;
                int size = decryptedByteArray.length - half_chunk;
                byte[] temp_Array = new byte[size + 1];
                System.arraycopy(decryptedByteArray, startpos, temp_Array, 0,
                        decryptedByteArray.length - startpos);
                out.write(temp_Array, 0, temp_Array.length);
                temp_Array = null;
                requestCounter = 0;
                encryptedByteArray = null;
                decryptedByteArray = null;
                offsetToReadFile += chunkSizeToReadFileOnline;

                if ((len - offsetToReadFile) < chunkSizeToReadFileOnline) {
                    chunkSizeToReadFileOnline = (int) len - (int) offsetToReadFile;
                }
                counter++;
            }

            while (offsetToReadFile < len && validfile == 0
                    && requestCounter == 0 && counter == 0) {// Loop to read
                // file, decrypt
                // file and
                // untweak file
                // in chunks
                // only for
                // first chunk
                // block
                readAndDecryptFileForServerStream();
                out.write(decryptedByteArray, 10,
                        (decryptedByteArray.length - 10));
                encryptedByteArray = null;
                decryptedByteArray = null;
                offsetToReadFile += chunkSizeToReadFileOnline;

                if ((len - offsetToReadFile) < chunkSizeToReadFileOnline) {
                    chunkSizeToReadFileOnline = (int) len - (int) offsetToReadFile;
                }
                counter++;
            }

            while (offsetToReadFile < len && validfile == 0
                    && requestCounter == 0 && counter != 0) {// Loop to read
                // file, decrypt
                // file and
                // untweak file
                // in chunks
                // upto length
                // of file
                readAndDecryptFileForServerStream();
                out.write(decryptedByteArray, 0, decryptedByteArray.length);
                encryptedByteArray = null;
                decryptedByteArray = null;
                offsetToReadFile += chunkSizeToReadFileOnline;

                if ((len - offsetToReadFile) < chunkSizeToReadFileOnline) {
                    chunkSizeToReadFileOnline = (int) len - (int) offsetToReadFile;
                }
            }

            encryptedByteArray = null;
            decryptedByteArray = null;
            is.close();
            url = null;
        } catch (Exception e) {
            try {
                encryptedByteArray = null;
                decryptedByteArray = null;
                url = null;
                is.close();
            } catch (Exception ex) {
            }
        }
    }

    private void enc_file_key(String filename, String path1) {
        try {

            if (filename.length() < 9) {
                filename = "index.swf";
            }

            String file_key = filename.substring(0, 1);

            file_key = file_key + filename.substring(filename.indexOf(".", 2) - 4, filename.indexOf(".", 2));
            String numberAsString = new Integer(filename.length()).toString();
            file_key = file_key + (char) Integer.parseInt(numberAsString);
            int pos = 2;
            String s_pos = filename.substring(pos + 3, pos + 4);

            if (s_pos.matches("[0-9]")) {
                file_key = file_key + (char) Integer.parseInt(filename.substring(pos + 2, pos + 4));
            } else {
                int first_digit = 2;
                char c = s_pos.charAt(0);
                int total = (int) c + first_digit;
                file_key = file_key + (char) total;
            }
            filekey = file_key + (char) Integer.parseInt(numberAsString);

        } catch (Exception e) {
            validfile = 1;
        }
    }

    // Set File Content Range for file request
    private void checkFileRange(String range) {
        try {
            long con_len = 0;
            String c_len = "Content-Length: ";
            String con_range = "Content-Range: bytes ";
            if (range.contains("=0-") || range.length() <= 0) {// while content range request for start from initial so, condition set Content-Range like, (Ex:-Content-Range: bytes 0-56658075/56658076)

//                registerBroadCastForResetSocket();

                offsetToReadFile = 0;
                c_len += originalbytes - 10 + "\n\n";
                con_len = originalbytes - 10;
                long last_con_len = con_len - 1;
                con_range = con_range + "0-" + last_con_len + "/" + con_len + "\n";
            } else {// while content range request for starting content not from initial level so, condition set Content-Range like, (Ex:-Content-Range: bytes 17256079-56658075/56658076)
//                int remain_chunk = Integer.parseInt(range.substring(range.indexOf("=") + 1, range.length() - 1));
                int remain_chunk = Integer.parseInt(range.substring(range.indexOf("=") + 1, range.indexOf("-")));
                int left_total_chunk = remain_chunk / 1024;
                half_chunk = remain_chunk % 1024;
                offsetToReadFile = left_total_chunk * 1032;
                c_len += originalbytes - remain_chunk - 10 + "\n\n";
                counter = 2;// comes inside else block while jump in video execution at that time requestCounter set 1
                bis.close();
                bis = new BufferedInputStream(new FileInputStream(fileName));
                long last_con_len = originalbytes - 11;
                long start_con_len = remain_chunk;
                long total_con_len = originalbytes - 10;
                con_range = con_range + start_con_len + "-" + last_con_len + "/" + total_con_len + "\n";
                bis.skip(offsetToReadFile + 1);
            }

            String con_type = "";
            if (fileName.contains(".mp4")) {
                con_type = "video/mp4";
            } else if (fileName.contains(".pdf")) {
                con_type = "application/pdf";
            } else if (fileName.contains(".swf")) {
                con_type = "application/x-shockwave-flash";
            } else if (fileName.contains(".html") || fileName.contains(".htm")) {
                con_type = "text/html";
            } else if (fileName.contains(".jpeg") || fileName.contains(".jpg")) {
                con_type = "image/jpeg";
            } else if (fileName.contains(".png")) {
                con_type = "image/png";
            } else if (fileName.contains(".gif")) {
                con_type = "image/gif";
            } else if (fileName.contains(".xml")) {
                con_type = "application/xml";
            } else {
                con_type = "text/html";
            }
            String c_type = "Content-Type: " + con_type + "\n";
            if (fileName.contains(".mp4")) {
                if (iswmplayer == 2)// for ST player
                {
                    out.write("HTTP/1.1 200 Ok\n".getBytes());
                } else // for media player
                {
                    out.write("HTTP/1.1 206 Partial Content\n".getBytes());
                }
                out.write(c_type.getBytes());
                out.write(con_range.getBytes());
                out.write("Accept-Ranges: bytes\n".getBytes());
                out.write(c_len.getBytes());
            } else if (!fileName.contains("_files/")) {
                out.write("HTTP/1.1 200 Ok\n".getBytes());
                out.write(c_type.getBytes());
                out.write(con_range.getBytes());
                out.write("Accept-Ranges: bytes\n".getBytes());
                out.write(c_len.getBytes());
            }
            //System.out.println("rangein loop");
        } catch (Exception e) {
            validfile = 1;
        }
    }

    private void checkFileRangeForServerContent(String range) {
        try {
            long con_len = 0;
            String con_range = "Content-Range: bytes ";
            if (range.contains("=0-") || range.length() <= 0) {// while content

                // range request
                // for start
                // from initial
                // so, condition
                // set
                // Content-Range
                // like,
                // (Ex:-Content-Range:
                // bytes
                // 0-56658075/56658076)
                offsetToReadFile = 0;
                con_len = originalbytes - 10;
                requestCounter = 0;
                half_chunk = 0;
                long last_con_len = con_len - 1;
                con_range = con_range + "0-" + last_con_len + "/" + con_len + "\n";
            } else {// while content range request for starting content not from
                // initial level so, condition set Content-Range like,
                // (Ex:-Content-Range: bytes 17256079-56658075/56658076)
                int remain_chunk = Integer.parseInt(range.substring(
                        range.indexOf("=") + 1, range.length() - 1));
                int left_total_chunk = remain_chunk / 1024;
                half_chunk = remain_chunk % 1024;
                offsetToReadFile = left_total_chunk * 1032;
                con_len = originalbytes - remain_chunk - 10;
                counter = 1;
                requestCounter = 1;// comes inside else block while jump in
                // video execution at that time
                // requestCounter set 1
                offsetToReadFile++;
                long last_con_len = originalbytes - 11;
                long start_con_len = remain_chunk;
                long total_con_len = originalbytes - 10;
                con_range = con_range + start_con_len + "-" + last_con_len + "/" + total_con_len + "\n";
                url = new URL(filepath);
                URLConnection urlCon = url.openConnection();
                urlCon.setRequestProperty("Range", "bytes=" + offsetToReadFile
                        + "-");// set property to read file from given range of
                // request file
                is = urlCon.getInputStream();
                offsetToReadFile--;
            }
            httpResponse("Content-Length: " + con_len + "\n\n", con_range);
        } catch (Exception e) {
        }
    }

    private void httpResponse(String c_len, String con_range) {
        try {
            String con_type = "";
//			if (fileName.contains("_011_")) {
            if (fileName.contains(".mp4")) {
                con_type = "video/mp4";
//			} else if (fileName.contains("_031_") || fileName.contains("_021_") || fileName.contains(".html") || fileName.contains(".htm")) {
            } else if (fileName.contains(".html") || fileName.contains(".htm")) {
                con_type = "text/html";
            } else if (fileName.contains(".swf")) {
                // con_type = "text/html";
                con_type = "application/x-shockwave-flash";
            } else if (fileName.contains(".unity3d")) {
                con_type = "application/vnd.unity";
//			} else if (fileName.contains("_062_") || fileName.contains("_061_") || fileName.contains("_065_")) {
            } else if (fileName.contains(".jpeg") || fileName.contains(".jpg")) {
                con_type = "image/jpeg";
            } else if (fileName.contains(".png")) {
                con_type = "image/png";
            } else if (fileName.contains(".gif")) {
                con_type = "image/gif";
            } else {
                con_type = "text/html";
            }
            String c_type = "Content-Type: " + con_type + "\n";
            if (!fileName.contains("_files/")) {
                out.write("HTTP/1.1 206 Partial Content\n".getBytes());
                out.write(c_type.getBytes());
                out.write(con_range.getBytes());
                out.write(c_len.getBytes());
            }
        } catch (Exception e) {
        }
    }

    private void readAndDecryptFileForServerStream() {
        try {
            // read file process start.
            encryptedByteArray = new byte[chunkSizeToReadFileOnline];
            int offset = 0;
            while (offset < chunkSizeToReadFileOnline) {// Loop to read bytes of
                // requestFile
                int len = is.read(encryptedByteArray, offset,
                        chunkSizeToReadFileOnline - offset);
                offset += len;
            }// read file process over.

            decryptedByteArray = new byte[encryptedByteArray.length];
            int chunkSizeToDecrypt = chunkSizeForDecryption;
            int deccounter = 0, offsetForDecryption = 0, offsetForStartPoint = 0;

            if (encryptedByteArray.length < chunkSizeToDecrypt) // if length of
            // file is short
            // (less than
            // 2times of
            // defined chunk
            // size), then
            // redefine
            // chunk size as
            // file size / 2
            {
                chunkSizeToDecrypt = encryptedByteArray.length;
            }

            int lastCipherModular = 0;
            while (offsetForDecryption < decryptedByteArray.length) // Loop to
            // read
            // encrypted
            // bytes and
            // decrypt
            // it
            {

                System.arraycopy(decryptionCipher.doFinal(encryptedByteArray,
                        offsetForDecryption, chunkSizeToDecrypt), 0,
                        decryptedByteArray, offsetForStartPoint,
                        decryptionCipher.doFinal(encryptedByteArray, offsetForDecryption,
                                chunkSizeToDecrypt).length);
                lastCipherModular = chunkSizeToDecrypt
                        - decryptionCipher.doFinal(encryptedByteArray,
                        offsetForDecryption, chunkSizeToDecrypt).length;
                offsetForStartPoint += decryptionCipher.doFinal(encryptedByteArray,
                        offsetForDecryption, chunkSizeToDecrypt).length;

                offsetForDecryption += chunkSizeToDecrypt;
                deccounter++;

                if ((encryptedByteArray.length - offsetForDecryption) < chunkSizeToDecrypt) {
                    chunkSizeToDecrypt = encryptedByteArray.length
                            - offsetForDecryption;
                }
            }

            byte[] tempArray;
            if (deccounter > 1) {
                tempArray = new byte[encryptedByteArray.length
                        - (((deccounter - 1) * 8) + lastCipherModular)];
            } else {
                tempArray = new byte[encryptedByteArray.length
                        - lastCipherModular];
            }
            System.arraycopy(decryptedByteArray, 0, tempArray, 0,
                    tempArray.length);

            decryptedByteArray = tempArray;
            tempArray = null;
        } catch (Exception e) {
            validfile = 1;
        }
    }

    // function for decrypt byte of the file
    private void readAndDecryptFile() {
        try {
            // read file process start.
            encryptedByteArray = new byte[chunkSizeToReadFileOffline];
            int offset = 0;
            while (offset < chunkSizeToReadFileOffline) {// Loop to read bytes of requestFile
                int len = bis.read(encryptedByteArray, offset, chunkSizeToReadFileOffline - offset);
                offset += len;
            }// read file process over.

            decryptedByteArray = new byte[encryptedByteArray.length];
            int chunkSizeToDecrypt = 1032;
            int deccounter = 0, offsetForDecryption = 0, offsetForStartPoint = 0;

            if (encryptedByteArray.length < chunkSizeToDecrypt) // if length of file is short (less than 2times of defined chunk size), then redefine chunk size as file size / 2
            {
                chunkSizeToDecrypt = encryptedByteArray.length;
            }

            int lastCipherModular = 0;
            while (offsetForDecryption < decryptedByteArray.length) // Loop to read encrypted bytes and decrypt it
            {
                System.arraycopy(decryptionCipher.doFinal(encryptedByteArray, offsetForDecryption, chunkSizeToDecrypt), 0, decryptedByteArray, offsetForStartPoint, decryptionCipher.doFinal(encryptedByteArray, offsetForDecryption, chunkSizeToDecrypt).length);
                lastCipherModular = chunkSizeToDecrypt - decryptionCipher.doFinal(encryptedByteArray, offsetForDecryption, chunkSizeToDecrypt).length;
                offsetForStartPoint += decryptionCipher.doFinal(encryptedByteArray, offsetForDecryption, chunkSizeToDecrypt).length;

                offsetForDecryption += chunkSizeToDecrypt;
                deccounter++;

                if ((encryptedByteArray.length - offsetForDecryption) < chunkSizeToDecrypt) {
                    chunkSizeToDecrypt = encryptedByteArray.length - offsetForDecryption;
                }
            }

            byte[] tempArray;
            if (deccounter > 1) {
                tempArray = new byte[encryptedByteArray.length - (((deccounter - 1) * 8) + lastCipherModular)];
            } else {
                tempArray = new byte[encryptedByteArray.length - lastCipherModular];
            }
            System.arraycopy(decryptedByteArray, 0, tempArray, 0, tempArray.length);

            decryptedByteArray = tempArray;
            tempArray = null;
        } catch (Exception e) {
            validfile = 1;
        }
    }

//    public void registerBroadCastForResetSocket() {
//        BroadcastReceiver mReceiver = new BroadcastReceiver() {
//            @Override
//            public void onReceive(Context context, Intent intent) {
//                try {
//                    encryptedByteArray = null;
//                    decryptedByteArray = null;
//                    if (bis != null) {
//                        bis.close();
//                    }
//                    if (out != null) {
//                        out.close();
//                    }
//                    if (m_socket != null) {
//                        m_socket.close();
//                    }
//                } catch (IOException e) {
//                    e.printStackTrace();
//                }
//            }
//        };
//        IntentFilter intentFilter = new IntentFilter();
//        intentFilter.addAction(Util.ACTION_RESET_SOCKET);
//        context.registerReceiver(mReceiver, intentFilter);
//    }
}