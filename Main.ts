import { RealtimeTransferProtocol } from "./RealtimeTransferProtocol";
import { ServerUDP } from "./ServerUDP";

class Main {
  constructor() {
    try {
      new ServerUDP();
      // new RealtimeTransferProtocol();
    } catch (error) {
      console.warn("Server Error", error);
    }
  }
}

new Main();
