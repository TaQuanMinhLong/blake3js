import { EventEmitter } from "events";
import fs from "fs";

export class FileWatcher extends EventEmitter {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.watcher = null;
    this.currentStream = null;
  }

  start() {
    // Create the file if it doesn't exist
    try {
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, Buffer.alloc(0));
      }
    } catch (error) {
      this.emit("error", error);
      return this;
    }

    // Using fs.watch (more efficient for most cases)
    this.watcher = fs.watch(this.filePath, (eventType, filename) => {
      if (eventType === "change") {
        // Close any existing stream
        if (this.currentStream) {
          this.currentStream.destroy();
        }

        // Create a new read stream for binary data
        this.currentStream = fs.createReadStream(this.filePath);

        const chunks = [];

        this.currentStream.on("data", (chunk) => {
          chunks.push(chunk);
        });

        this.currentStream.on("end", () => {
          // Combine all chunks into a single Buffer
          const content = Buffer.concat(chunks);

          // Emit the change event with the binary content
          this.emit("change", content);
        });

        this.currentStream.on("error", (err) => {
          this.emit("error", err);
        });
      }
    });

    // Handle errors
    this.watcher.on("error", (error) => {
      this.emit("error", error);
    });

    return this;
  }

  stop() {
    if (this.currentStream) {
      this.currentStream.destroy();
      this.currentStream = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    fs.unlink(this.filePath, (err) => {
      if (err) {
        console.error("Error removing temporary file:", err);
      }
    });
    return this;
  }
}
