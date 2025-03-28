(function () {
    class ChatWidget {
        constructor(options) {
            this.socketUrl = options.socketUrl || "wss://dev.techpay.ai/salesbot";
            this.agentHandle = options.agent_handle || "default-bot";
            this.socket = null;
            this.chatContainer = null;
            this.init();
        }

        init() {
            this.injectStyles();
            this.createChatButton();
        }

        injectStyles() {
            const style = document.createElement("style");
            style.innerHTML = `
                #chat-widget {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #007bff;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0px 4px 6px rgba(0,0,0,0.2);
                    font-family: Arial, sans-serif;
                }
                #chat-box {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 320px;
                    height: 450px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
                    display: none;
                    flex-direction: column;
                    font-family: Arial, sans-serif;
                    overflow: hidden;
                }
                #chat-header {
                    background: #007bff;
                    color: white;
                    padding: 10px;
                    text-align: center;
                    font-weight: bold;
                }
                #chat-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                    font-size: 14px;
                    display: flex;
                    flex-direction: column;
                }
                .chat-message {
                    padding: 8px;
                    margin: 5px;
                    border-radius: 5px;
                    max-width: 80%;
                }
                .bot-message {
                    background: #f1f1f1;
                    align-self: flex-start;
                }
                .user-message {
                    background: #007bff;
                    color: white;
                    align-self: flex-end;
                }
                .option-button {
                    display: block;
                    margin: 5px;
                    padding: 8px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    text-align: left;
                }
                .option-button:hover {
                    background: #0056b3;
                }
            `;
            document.head.appendChild(style);
        }

        createChatButton() {
            const button = document.createElement("div");
            button.id = "chat-widget";
            button.innerText = "Chat";
            button.onclick = () => this.toggleChat();
            document.body.appendChild(button);
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

        createChatBox() {
            this.chatContainer = document.createElement("div");
            this.chatContainer.id = "chat-box";

            const header = document.createElement("div");
            header.id = "chat-header";
            header.innerText = "Chat with AI Bot";

            const body = document.createElement("div");
            body.id = "chat-body";

            this.chatContainer.appendChild(header);
            this.chatContainer.appendChild(body);
            document.body.appendChild(this.chatContainer);
        }

        connectWebSocket() {
            if (this.socket) return;

            this.socket = new WebSocket(this.socketUrl);

            this.socket.onopen = () => {
                console.log("ChatBot Connected");
                this.sendMessage("start");
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.receiveMessage(data);
                } catch (error) {
                    console.error("Invalid JSON from server:", event.data);
                }
            };

            this.socket.onerror = (error) => {
                console.error("WebSocket Error:", error);
            };
            this.socket.onclose = (event) => {
                console.log("ChatBot Disconnected. Reconnecting in 3s...", event);
                this.socket = null;
                setTimeout(() => this.connectWebSocket(), 3000);
            };
            
        }

        sendMessage(option) {
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify({ userSelection: option }));
                this.appendMessage("You", option, "user-message");
            }
        }

        receiveMessage(data) {
            const body = document.getElementById("chat-body");
            const botMessage = document.createElement("div");
            botMessage.classList.add("chat-message", "bot-message");
            botMessage.innerText = data.message;
            body.appendChild(botMessage);

            if (data.message.includes("1.")) {
                const options = data.message.match(/\d+\.\s[^\n]+/g);
                if (options) {
                    options.forEach((optionText) => {
                        const option = optionText.replace(/^\d+\.\s/, "");
                        const optionButton = document.createElement("button");
                        optionButton.classList.add("option-button");
                        optionButton.innerText = option;
                        optionButton.onclick = () => this.handleOptionSelect(option);
                        body.appendChild(optionButton);
                    });
                }
            }
            body.scrollTop = body.scrollHeight;
        }

        handleOptionSelect(option) {
            this.sendMessage(option);
        }
    }

    window.ChatWidget = {
        init: (options) => new ChatWidget(options)
    };
})();
// const ws = new WebSocket("wss://dev.techpay.ai/salesbot"); // Change to wss:// if needed

// ws.onopen = () => console.log("✅ WebSocket Connected Successfully!");
// ws.onerror = (error) => console.error("❌ WebSocket Error:", error);
// ws.onmessage = (event) => console.log("📩 Received:", event.data);
// ws.onclose = () => console.warn("⚠️ WebSocket Closed!");
const ws = new WebSocket("wss://echo.websocket.events");

ws.onopen = () => console.log("✅ Connected to Echo WebSocket!");
ws.onmessage = (event) => console.log("📩 Received:", event.data);
ws.onerror = (error) => console.error("❌ Error:", error);
ws.onclose = () => console.warn("⚠️ Connection Closed!");

// Send a test message after connection
setTimeout(() => ws.send("Hello WebSocket!"), 2000);
