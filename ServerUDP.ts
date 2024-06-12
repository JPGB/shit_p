import dgram, { Socket, type RemoteInfo } from "dgram";

export class ServerUDP {
  private socket = dgram.createSocket("udp4");

  constructor(port = 5060) {
    this.socket.bind(port, () => {
      console.warn(`Server started on port: ${port}`);
    });

    this.socket.on("message", (message, remoteInfo) => {
      this.handleMessage(message, remoteInfo, this.socket);
    });

    // this.socket.on("connect", (socket) => {
    //   this.handleMessage(message, remoteInfo, this.socket);
    // });
  }

  private handleMessage(
    dataBuffer: Buffer,
    remoteInfo: RemoteInfo,
    socket: Socket
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const { requestType, uri, requestVersion, headers } =
          await this.parseHeaders(dataBuffer);

        switch (requestType) {
          case "REGISTER":
            this.registerSIP({ requestVersion, headers });
            break;

          case "INVITE":
            this.inviteSIP({ requestVersion, headers });
            break;

          default:
            if (dataBuffer.toString().trim()) {
              console.warn(JSON.stringify(dataBuffer.toString()));
              console.warn(socket);

              console.warn("METHOD NOT IMPLEMENTED!");
            }
            break;
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private registerSIP({
    requestVersion,
    headers,
  }: {
    requestVersion: string;
    headers: {
      [key: string]: string;
    };
  }) {
    console.warn(
      `${requestVersion} 200 OK\r\nVia: ${headers.Via}\r\nFrom: ${headers.From}\r\nTo: ${headers.To}\r\nCall-ID: ${headers["Call-ID"]}\r\nCSeq: ${headers.CSeq}\r\nServer: testJPerson\r\nContent-Length: 0\r\n\r\n`,
      parseInt(headers.Via.split(" ")[1].split(";")[0].split(":")[1]),
      headers.Via.split(" ")[1].split(";")[0].split(":")[0]
    );

    this.socket.send(
      `${requestVersion} 200 OK\r\nVia: ${headers.Via}\r\nFrom: ${headers.From}\r\nTo: ${headers.To}\r\nCall-ID: ${headers["Call-ID"]}\r\nCSeq: ${headers.CSeq}\r\nServer: testJPerson\r\nContent-Length: 0\r\n\r\n`,
      parseInt(headers.Via.split(" ")[1].split(";")[0].split(":")[1].trim()),
      headers.Via.split(" ")[1].split(";")[0].split(":")[0].trim()
    );
  }

  private parseHeaders(dataBuffer: Buffer): Promise<{
    requestType: string;
    uri: string;
    requestVersion: string;
    headers: {
      [key: string]: string;
    };
  }> {
    return new Promise((resolve, reject) => {
      try {
        const [request, ...unparsedHeaders] = dataBuffer
          .toString("utf8")
          .split("\r\n");

        const headers = Object.fromEntries(
          unparsedHeaders.map((header) => {
            const [key, ...value] = header.split(":");
            return [key, value.join(":").trim()];
          })
        );

        const [requestType, uri, requestVersion] = request.split(" ");

        resolve({ requestType, uri, requestVersion, headers });
      } catch (error) {
        reject(error);
      }
    });
  }

  private inviteSIP({
    requestVersion,
    headers,
  }: {
    requestVersion: string;
    headers: {
      [key: string]: string;
    };
  }) {}
}
