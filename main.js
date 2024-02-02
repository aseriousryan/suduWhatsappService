const axios = require("axios")
const qrcode = require("qrcode-terminal")
const express = require("express")
const app = express()
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js")
const multer = require("multer")
const { createClient } = require("@supabase/supabase-js")
const bcrypt = require("bcrypt")
const supabaseUrl = "http://195.35.7.235:8000"
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzA1NTkzNjAwLAogICJleHAiOiAxODYzNDQ2NDAwCn0.IOdYznc_Hy78vBQtJOAqObVhhCQOWF2t70K8Gkd3si4"
const supabase = createClient(supabaseUrl, supabaseKey)
const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const upload = multer()

const port = 3000
app.use(express.json())
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Whatsapp Service",
      version: "1.1.0",
    },
    servers: [
      {
        url: "http://localhost:3000/",
      },
    ],
  },
  apis: ["./main.js"],
}

const swaggerSpec = swaggerJSDoc(options)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox"],
  },
})

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true })
})

client.on("ready", () => {
  console.log("Client is ready!")
})

app.listen(port, () => {
  console.log(
    `Wait until client is ready message is shown before sending requests.`
  )
})

function validateAndFormatPhoneNumber(phoneNumber) {
  const startsWith6 = phoneNumber.startsWith("6")

  const endsWithCus = phoneNumber.endsWith("@c.us")

  if (!startsWith6) {
    phoneNumber = "6" + phoneNumber
  }

  if (!endsWithCus) {
    phoneNumber += "@c.us"
  }

  return phoneNumber
}

client.on("message", async (message) => {
  var chat = await client.getChatById(message.from)
  chat.sendStateTyping()
  //    message.sendStateTyping();
  const contactnumber = message.from.split("@")
  const url =
    "http://sudu.ai:8000/rest/v1/contact?contact_number=eq." +
    contactnumber[0] +
    "&select=*"
  axios
    .get(url, {
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE",
      },
    })
    .then(function (response) {
      console.log(response.data[0])
      if (response.data[0] != null) {
        // setInterval(client.sendMessage(message.from, 'we are trying hard now.'), 2000);
        axios
          .post("http://192.168.1.50:8085/chat", "", {
            params: {
              msg: message.body,
              database_name: "de_carton",
            },
            headers: {
              accept: "application/json",
              "content-type": "application/x-www-form-urlencoded",
            },
          })
          .then(function (data) {
            console.log(String(data))

            message.reply(data.data.result)
            clearInterval()
          })
          .catch(function (errors) {
            console.log(errors)
          })

        //        message.reply('fuck u dont talk too much..');
      } else {
        client.sendMessage(message.from, "You are not a valid user")
      }
    })
    .catch(function (error) {
      console.log(error)
    })

  //      console.log(contactnumber[0]);
  //      console.log(response.body);
})

async function getUserUUID(companyId) {
  const companyUrl =
    "http://sudu.ai:8000/rest/v1/company?id=eq." +
    companyId +
    "&select=user_uuid"
  try {
    const companyResponse = await axios.get(companyUrl, {
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE",
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE",
      },
    })
    return companyResponse.data[0].user_uuid
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 * @swagger
 * /register:
 *   post:
 *     summary: This API is used to register a user.
 *     description: This API is used to register a user.
 *     requestBody:
 *       description: User registration data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: The client ID for registration.
 *               password:
 *                 type: string
 *                 description: The password for registration.
 *               confirmPassword:
 *                 type: string
 *                 description: The confirmed password for registration.
 *     responses:
 *       200:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
app.post("/register", async (req, res) => {
  const { clientId, password, confirmPassword } = req.body

  if (!clientId || clientId == null) {
    return res.status(400).json({ error: "clientId is required" })
  }

  if (
    !password ||
    password == null ||
    !confirmPassword ||
    confirmPassword == null
  ) {
    return res
      .status(400)
      .json({ error: "password and confirmPassword is required" })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" })
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    // console.log("Hashed Password:", hashedPassword);

    // Check if user already exists
    const { data: existingUser, error: userError } = await supabase
      .from("users")
      .select("clientId")
      .eq("clientId", clientId)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    // Insert a new user with hashed password
    const { error: insertError } = await supabase
      .from("users")
      .upsert([{ clientId, password: hashedPassword }], {
        onConflict: ["clientId"],
      })

    if (insertError) {
      console.error("Supabase Insert Error:", insertError)
      return res.status(500).json({ error: "Failed to register user" })
    }

    // Fetch the registered user data
    const { data: newUser, error: selectError } = await supabase
      .from("users")
      .select("*")
      .eq("clientId", clientId)
      .single()

    if (selectError || !newUser) {
      console.error("Supabase Select Error:", selectError)
      return res.status(500).json({ error: "Failed to fetch registered user" })
    }

    //console.log("New User Registered:", newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    })
  } catch (error) {
    console.error("Registration Error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

/**
 * @swagger
 * /login:
 *   post:
 *     summary: This API is used to log a user in.
 *     description: This API is used to log a user in.
 *     requestBody:
 *       description: User login data.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: The client ID for login.
 *               password:
 *                 type: string
 *                 description: The password for login.
 *     responses:
 *       200:
 *         description: User logged in successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */
app.post("/login", async (req, res) => {
  const { clientId, password } = req.body

  const { data: users, error } = await supabase
    .from("users")
    .select("clientId, password")
    .eq("clientId", clientId)
    .single()

  //console.log("Supabase Query Response:", { users, error })

  if (error || !users) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const isPasswordValid = await bcrypt.compare(password, users.password)

  //console.log("Password Comparison Result:", isPasswordValid)

  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid credentials" })
  }
})

/**
 * @swagger
 * /submit:
 *   post:
 *     security:
 *     summary: Submit image and message to a contact
 *     description: Submit image and message to a contact
 *     requestBody:
 *       description: Data to be submitted, including an image.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               contact_num:
 *                 type: string
 *                 description: The contact number for the message to be sent to.
 *               clientId:
 *                 type: string
 *                 description: The client ID.
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: The image/document file to be uploaded.
 *               msg:
 *                 type: string
 *                 description: An optional message.
 *     responses:
 *       200:
 *         description: Data submitted successfully.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */
app.post("/submit", upload.single("img"), async (req, res) => {
  try {
    const { contact_num, msg } = req.body
    const file = req.file

    const missingParameters = []

    if (file) {
      const media = new MessageMedia(
        file.mimetype,
        file.buffer.toString("base64"),
        file.originalname
      )

      const updated_contact_num = validateAndFormatPhoneNumber(contact_num)
      await client.sendMessage(updated_contact_num, media, { caption: msg })
    } else if (msg) {
      const updated_contact_num = validateAndFormatPhoneNumber(contact_num)
      await client.sendMessage(updated_contact_num, msg)
    } else {
      return res.status(400).json({
        success: false,
        error: "Either 'img' or 'msg' parameter is required",
      })
    }

    res
      .status(200)
      .send({ success: true, message: "Data processed successfully" })
  } catch (error) {
    res.status(500).send({ success: false, error: error.message })
  }
})

client.initialize()
