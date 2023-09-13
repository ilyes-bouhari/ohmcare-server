const http = require("http");
const express = require("express");
const uuid = require("uuid");
const mqtt = require("mqtt");
const { WebSocketServer } = require("ws");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PROT || 8000;

const app = express();
const server = http.createServer(app);
const clients = {};

const ws_server = new WebSocketServer({ server });

ws_server.on("connection", function (connection) {
  const userId = uuid.v4();
  clients[userId] = connection;

  connection.on("close", () => delete clients[userId]);
});

const mqtt_client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`);

mqtt_client.on("connect", () => {
  console.log("Connected to MQTT borker");

  mqtt_client.subscribe("/test/+/events", () =>
    console.log(`Subscribed to a wildcard topics`)
  );
});

mqtt_client.on("message", (topic, payload) => {
  console.log("Received Message:", topic, payload.toString());
  Object.values(clients).forEach((client) => client.send(payload.toString()));
});

app.get("/", (req, res) => {
  res.send("Ohmcare server is running ✅");
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
