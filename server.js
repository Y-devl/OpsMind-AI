import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

let sopText = ""; // Stores uploaded SOP content

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("OpsMind AI SOP Agent Backend Running 🚀");
});

/* ================= FILE UPLOAD ================= */
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  sopText = fs.readFileSync(req.file.path, "utf-8");
  fs.unlinkSync(req.file.path);

  res.json({ message: "SOP uploaded successfully ✅" });
});

/* ================= ASK QUESTION ================= */
app.post("/ask", (req, res) => {
  const question = req.body.question?.toLowerCase();

  if (!sopText) {
    return res.json({ answer: "Please upload an SOP file first 📄" });
  }

  const lines = sopText.split("\n");

  let maxMatches = 0;
  let bestLine = "";

  for (let line of lines) {
    const matches = question
      .split(" ")
      .filter((word) => line.toLowerCase().includes(word)).length;

    if (matches > maxMatches) {
      maxMatches = matches;
      bestLine = line;
    }
  }

  if (maxMatches > 0) {
    const cleanAnswer = bestLine.replace(/^[^:]+:\s*/, "");
    res.json({ answer: "📘 " + cleanAnswer });
  } else {
    res.json({ answer: "Sorry, I couldn't find this in the SOP 🤔" });
  }
});

/* ================= START SERVER ================= */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
