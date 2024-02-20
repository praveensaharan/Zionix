const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
async function fetchPriceFromMouser(partNumber, quantity, apiKey) {
  try {
    const requestBody = {
      SearchByKeywordRequest: {
        // Change this line
        keyword: partNumber,
        records: 0,
        startingRecord: 0,
        searchOptions: "string",
        searchWithYourSignUpLanguage: "string",
      },
    };

    const response = await axios.post(
      `https://api.mouser.com/api/v1/search/keyword?apiKey=${apiKey}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
          "x-mouser-api-key": apiKey,
        },
      }
    );

    const parts = response.data?.SearchResults?.Parts || [];

    if (parts.length === 0) {
      return "Part not found";
    }

    const part = parts[0];
    const priceBreak = part.PriceBreaks;
    let price = priceBreak.find(
      (item) => Number(item.Quantity) === Number(quantity)
    );
    price = price
      ? price.Price + " " + price.Currency
      : "Not Found This Quantity";

    return price;
  } catch (error) {
    console.error("Error fetching price from Mouser:", error);
    return "NA";
  }
}

async function fetchPartFromRutronik(apiKey, partNumber, quantity) {
  try {
    const response = await axios.get(
      `https://www.rutronik24.com/api/article/`,
      {
        params: {
          apikey: apiKey,
          mpn: partNumber,
        },
      }
    );

    const rutronik = response.data.pricebreaks;

    let price2 = rutronik.find(
      (item) => Number(item.quantity) === Number(quantity)
    );
    price2 = price2
      ? price2.price + " " + response.data.currency
      : "Not Found This Quantity";

    return price2;
  } catch (error) {
    console.error("Error fetching part from Rutronik:", error);
    return null;
  }
}

async function fetchPricesFromTME(token, signature, product, quantity) {
  try {
    const url = "https://api.tme.eu/Products/GetPrices.json";

    // Define the parameters
    const parameters = new URLSearchParams();
    parameters.append("Token", token);
    parameters.append("Language", "EN");
    parameters.append("ApiSignature", signature);
    parameters.append("Country", "IN");
    parameters.append("Currency", "EUR");
    parameters.append("GrossPrices", "false");
    parameters.append("SymbolList[0]", product);

    const response = await axios.post(url, parameters);

    const Tme = response.data.Data.ProductList[0].PriceList;
    let Price3 = Tme.find((item) => Number(item.Amount) === Number(quantity));
    Price3 = Price3
      ? Price3.PriceValue + " " + response.data.Data.Currency
      : "Not Found This Quantity";

    return Price3;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

app.post("/getPrices", async (req, res) => {
  const { partNumber, quantity } = req.body;

  try {
    const mouserPrice = await fetchPriceFromMouser(
      partNumber,
      quantity,
      process.env.MOUSER_API_KEY
    );

    const rutronikPrice = await fetchPartFromRutronik(
      process.env.RUTRONIK_API_KEY,
      partNumber,
      quantity
    );
    const TmePrice = await fetchPricesFromTME(
      process.env.TME_TOKEN,
      process.env.TME_SIGNATURE,
      partNumber,
      quantity
    );

    res.json({
      mouserPrice: mouserPrice,
      rutronikPrice: rutronikPrice,
      tmePrice: TmePrice,
    });
  } catch (error) {
    console.error("Error getting prices:", error.message);
    res.status(500).json({ error: "Error getting prices" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
