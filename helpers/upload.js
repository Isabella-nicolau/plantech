const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e6);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(null, ok);
  },
});

async function enviarParaSupabase(filePath, fileName) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  const bucket = process.env.SUPABASE_BUCKET || "produtos";

  if (!url || !key) return null;

  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(url, key);
    const fileBuffer = fs.readFileSync(filePath);

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, { upsert: true, contentType: "image/jpeg" });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return null;
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicData.publicUrl;
  } catch (err) {
    console.error("Supabase error:", err.message);
    return null;
  }
}

module.exports = { upload, enviarParaSupabase };
