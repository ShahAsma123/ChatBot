(function () {
  class ChatBot {
    constructor(options) {
      this.socketUrl = options.socketUrl || "wss://dev.techpay.ai/salesbot/";
      this.agentHandle = options.agent_handle || "default-bot";
      this.socket = null;
      this.chatContainer = null;
      this.isWaitingForResponse = false;
      this.init();
    }

    init() {
      this.injectStyles();
      this.createChatButton();
    }

    injectStyles() {
      const style = document.createElement("style");
      style.innerHTML = `
                /* Floating Chat Button */
                #chat-bot {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: grey;
                    color: white;
                    width: 65px;
                    height: 65px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    transition: transform 0.2s ease-in-out;
                }
                #chat-bot:hover {
                    transform: scale(1.1);
                }
                #chat-bot img {
                    width: 35px;
                    height: 35px;
                }

                /* Chatbox UI */
                #chat-box {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 350px;
                    height: 500px;
                    background: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.3);
                    display: none;
                    flex-direction: column;
                    font-family: 'Arial', sans-serif;
                    overflow: hidden;
                }
                #chat-header {
                    background: #0056b3;
                    color: white;
                    padding: 15px;
                    text-align: center;
                    font-size: 16px;
                    font-weight: bold;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                #chat-close {
                    cursor: pointer;
                    font-size: 18px;
                }
                #chat-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    font-size: 14px;
                    background: #f9f9f9;
                }
                .chat-message {
                    padding: 10px;
                    margin: 5px;
                    border-radius: 8px;
                    max-width: 80%;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .bot-message {
                    background: #e3f2fd;
                    align-self: flex-start;
                    animation: fadeIn 0.3s ease-in-out;
                }
                .user-message {
                    background: #007bff;
                    color: white;
                    align-self: flex-end;
                    animation: fadeIn 0.3s ease-in-out;
                }

                /* Loading Indicator */
                .loading-dots {
                    display: inline-flex;
                    align-items: center;
                }
                .dot {
                    width: 8px;
                    height: 8px;
                    margin: 0 3px;
                    background-color: #007bff;
                    border-radius: 50%;
                    animation: blink 1.4s infinite;
                }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes blink {
                    0% { opacity: 0.2; }
                    50% { opacity: 1; }
                    100% { opacity: 0.2; }
                }

               
                .options-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin-top: 10px;
                }
                
                .option-button {
                  background-color: #007bff;
                  color: white;
                  border: none;
                  padding: 10px;
                  border-radius: 5px;
                  cursor: pointer;
                  text-align: left;
                  width: fit-content;
                }
                
                .option-button:hover {
                  background-color: #0056b3;
                }

                    
                    
                    
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(5px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    #restart-chat {
                    background: #ff3b30;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 10px;
                    margin-top: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background 0.2s;
                }
                #restart-chat:hover {
                    background: #d32f2f;
                }
            `;
      document.head.appendChild(style);
    }

    createChatButton() {
      const button = document.createElement("div");
      button.id = "chat-bot";
      button.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/924/924915.png" alt="Chat">`;
      button.onclick = () => this.toggleChat();
      document.body.appendChild(button);
    }

    createChatBox() {
      this.chatContainer = document.createElement("div");
      this.chatContainer.id = "chat-box";

      const header = document.createElement("div");
      header.id = "chat-header";
      header.innerHTML = `Chat with AI Bot <span id="chat-close">✖</span>`;

      const body = document.createElement("div");
      body.id = "chat-body";

      header.querySelector("#chat-close").onclick = () => {
        this.chatContainer.style.display = "none";
      };

      this.chatContainer.appendChild(header);
      this.chatContainer.appendChild(body);
      document.body.appendChild(this.chatContainer);
    }

    connectWebSocket() {
      if (this.socket) return;

      this.socket = new WebSocket(this.socketUrl);

      this.socket.onopen = () => {
        console.log("✅ ChatBot Connected");
        this.sendMessage("Select Any Option");
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.receiveMessage(data);
        } catch (error) {
          console.error("❌ Invalid JSON from server:", event.data);
        }
      };

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket Error:", error);
      };

      this.socket.onclose = () => {
        console.warn("⚠️ ChatBot Disconnected. Reconnecting...");
        this.socket = null;
        setTimeout(() => this.connectWebSocket(), 3000);
      };
    }

    toggleChat() {
      if (!this.chatContainer) {
        this.createChatBox();
      }
      this.chatContainer.style.display = this.chatContainer.style.display === "none" ? "flex" : "none";

      if (this.chatContainer.style.display === "flex") {
        this.connectWebSocket();
      }
    }

    sendMessage(option) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const body = document.getElementById("chat-body");
        body.innerHTML += `<div class="chat-message user-message">${option}</div>`;

        const loader = document.createElement("div");
        loader.className = "chat-message bot-message loading-message";
        loader.innerHTML = `<div class="loading-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>`;
        body.appendChild(loader);
        body.scrollTop = body.scrollHeight;

        this.socket.send(JSON.stringify({ userSelection: option }));
      }
    }
    receiveMessage(data) {
        console.log("Received message:", data); // Debugging
    
        const body = document.getElementById("chat-body");
    
        // Remove existing loading messages
        document.querySelector(".loading-message")?.remove();
    
        // Display bot message
        if (data.message) {
            const botMessage = document.createElement("div");
            botMessage.className = "chat-message bot-message";
            botMessage.innerText = data.message;
            body.appendChild(botMessage);
        }
    
        // Remove old options before adding new ones
        document.querySelector(".options-container")?.remove();
    
        // Extract options from the message text
        const options = this.extractOptionsFromMessage(data.message);
    
        // Ensure options are present and in array format
        if (options.length > 0) {
            console.log("Options available:", options); // Debugging
    
            const optionsContainer = document.createElement("div");
            optionsContainer.className = "options-container";
    
            options.forEach((option) => {
                const button = document.createElement("button");
                button.className = "option-button";
                button.innerText = option;
    
                // Add an event listener to send the selected option
                button.addEventListener("click", () => {
                    console.log("Selected option:", option);
                    this.sendMessage(option);
                });
    
                optionsContainer.appendChild(button);
            });
    
            body.appendChild(optionsContainer);
        } else {
            console.warn("No options extracted from the message.");
        }
    
        // Scroll to latest message
        body.scrollTop = body.scrollHeight;
    }
    
    /**
     * Extracts options dynamically from the message string
     */
    extractOptionsFromMessage(message) {
        const optionRegex = /([A-E])\)\s([^\n]+)/g;
        let match;
        const options = [];
    
        while ((match = optionRegex.exec(message)) !== null) {
            options.push(`${match[1]}) ${match[2]}`.trim()); // Extract option text
        }
    
        return options;
    }
    
    
    
       
  }

  window.ChatWidget = {
    init: (options) => new ChatBot(options),
  };
})();
