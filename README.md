# Zeptoh Form Fields Encrypt and Decrypt Task

## Backend Implementation

### Install dependencies

1. Navigate into the backend folder in the command prompt or terminal and run

```bash
npm install
```

### Start the server

1. While inside the `./backend` folder run the command

```bash
npm start # npm run start
```

2. You can see the following log in the console

```log
App running on PORT 3000
```

### Encryption

1. Created a helper function `encryptField` inside the file `encryptField.js`
   for `seperation of concerns`

2. The `encryptField` function accepts a string value as argument

3. Declared constant values `KEY` and `SALT` as per task description

4. For `KEY` as per task decription the given key `internsNeverGuess` is
   encryted using `sha256` algorithm

```js
const KEY = crypto.createHash("sha256").update("internsNeverGuess").digest();
const SALT = "SALT1234";
```

5. Creating an Initializing Vector value using `crypto` package `randomBytes`
   method. This provides different IV values even for same values

```js
const iv = crypto.randomBytes(16);
```

5. Defining a cipher with the specified `aes-256-cbc` algorithm with the hashed
   key and IV

```js
const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
```

6. Creating a encrypted value with the cipher and also prefixing the value with
   the mentioned `SALT` value

```js
const encryptedValue = Buffer.concat([
  cipher.update(SALT + value, "utf-8"),
  cipher.final(),
]).toString("base64");
```

7. The `encryptField` function returns an object containing the encrypted value
   and the Initializing Vector (IV).

```js
return {
  val: encryptedValue,
  iv: iv.toString("base64"),
};
```

### Defining Routes

#### GET Route

1. `GET` request to `/api/form` will send an array of objects with encrypted
   data and iv which is the result of calling `encryptField` function passing
   each form fields by using Array map method.

```js
const fields = ["email:text", "name:text", "don't_work"];

app.get("/api/form", (req, res) => {
  const encryptedArr = fields.map((field) => encryptField(field));

  res.status(200).json(encryptedArr);
});
```

#### POST Route

1. Here the form data is sent from the frontend and it simply logs the request
   body which is parsed thanks to `express.json()` middleware.

2. A response is sent with status 200 and message

```js
app.post("/api/submit", (req, res) => {
  console.log(req.body);

  res.status(200).json({ message: "Data received successfully" });
});
```
