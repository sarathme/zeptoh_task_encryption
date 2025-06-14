# Zeptoh Form Fields Encrypt and Decrypt Task

1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)

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

## Frontend Implementation

### Install dependencies - frontend

1. Navigate into the frontend folder in the command prompt or terminal and run

```bash
npm install
```

### Start the development server

1. While inside the `./frontend` folder run the command

```bash
npm run dev
```

### Decryption

1. Defined the constants `SALT` and the `KEY`. `KEY` is hashed as same as we do
   it in the backend with `SHA256` algorithm

```js
const SALT = "SALT1234";
const KEY = CryptoJS.SHA256("internsNeverGuess");
```

2. Defined a function `decryptFields` which accepts an object with properties
   `data` and `iv` in a seperate file under utils folder for seperation of
   concerns and the function is exported

```js
export function decryptField({ data, iv }) {}
```

3. Dependecies includes `crypto-js` package which I import and provide the
   algorithm `AES` and call the `decrypt` method and pass the `data`, `KEY` and
   `options` with `iv` value which is parsed to Binary from `base64`, `mode` as
   `CBC` as mentioned in the task description.

4. The decrypted value is converted to srting using the `toString` method
   passing the `utf-8` encoding obtained by the `CryptoJS` class

```js
CryptoJS.AES.decrypt(data, KEY, {
  iv: CryptoJS.enc.Base64.parse(iv),
  mode: CryptoJS.mode.CBC,
  padding: CryptoJS.pad.Pkcs7,
}).toString(CryptoJS.enc.Utf8);
```

5. After decrption we make some checks like does the decrypted value starts with
   the `SALT` prefix if not return null

```js
if (!decrypted.startsWith(SALT)) return null;
```

6. Remove the `SALT` prefix using `slice` method on strings.

```js
const fieldDef = decrypted.slice(SALT.length);
```

7. Used regular expression to check for the format `label:type` if the decrypted
   value does not meet the pattern then return null

```js
if (!/^.+:.+$/.test(fieldDef)) return null;
```

8. If above operations were success then we extract the label and type and
   return an object with properties `label` containing the label value and
   `type` containg the type value

```js
const [label, type] = fieldDef.split(":");
return { label, type };
```

### Rendering the inputs

#### Fetching and Decrypting the data

1. Encrypted data is fetched and decrypted using the `decryptField` function by
   passing the necessary parameters inside the `useEffect` hook with
   `empty dependency array` so that the function runs only on initial render.

2. Initialized a array using the `useState` hook for the decrypted fields.

3. Mapped through the fetched encrypted value and decrypted using the
   `decryptField` function

```js
const [fields, setFields] = useState([]);
const [index, setIndex] = useState(0);

useEffect(() => {
  async function getFields() {
    try {
      const res = await fetch("http://localhost:3000/api/form");

      const encFields = await res.json();
      const decryptedFields = encFields
        .map((field) => decryptField(field))
        .filter((field) => field !== null);
      console.log(decryptedFields);
      setFields(decryptedFields);
    } catch (error) {
      console.error("Fetch error:", error.message);
    }
  }

  getFields();
}, []);
```

4. Fallback if no valid fields were sent.

```jsx
if (fields.length === 0 || index >= fields.length)
  return <p>No valid Fields were sent</p>;
```

5. Some states to handle UI for differnt states

```js
// Handle submitting state
const [isSubmitting, setIsSubmitting] = useState(false);
// Handle submitted state
const [submitted, setSubmitted] = useState(false);
```

#### Handling onBlur event

1. Get the input's value and store it in a state `formData`

```js
const { name, value } = e.target;
setFormData((prev) => ({ ...prev, [name]: value }));
```

2. Check for more fields in the decrypted fields array by icrementing the index
   value.

3. If all the input values are processed the `formData` sent to the server and
   get submitted

```js
if (index + 1 < fields.length) {
  setIndex((index) => index + 1);
} else {
  setIsSubmitting(true);
  const res = await fetch("http://localhost:3000/api/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  await res.json();

  setIsSubmitting(false);
  setSubmitted(true);
}
```
