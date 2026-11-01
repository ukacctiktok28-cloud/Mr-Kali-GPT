export default function handler(req, res) {
  res.status(200).json({
    status: "online",
    assistant: "Mr Kali GPT"
  });
}
