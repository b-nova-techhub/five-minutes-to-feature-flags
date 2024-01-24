import express from "express";
import Router from "express-promise-router";
import cowsay from "cowsay";
import { OpenFeature, InMemoryProvider } from "@openfeature/server-sdk";

const app = express();
const routes = Router();
app.use((_, res, next) => {
  res.setHeader("content-type", "text/plain");
  next();
}, routes);

// A: create the OpenFeature client
const featureFlags = OpenFeature.getClient();

// B: The FLAG_CONFIGURATION for the InMemoryProvider
const FLAG_CONFIGURATION = {
  'with-cows': {
    variants: {
      on: true,
      off: false
    },
    disabled: false,
    defaultVariant: "off",
    contextEvaluator: (context) => {
      if (context.user === "Tom") {
        return "on";
      }
      return "off";
    },
  }
};

// C: Initialize a Provider
const featureFlagProvider = new InMemoryProvider(FLAG_CONFIGURATION);

// D: Set the Provider onto the OpenFeature Client
OpenFeature.setProvider(featureFlagProvider);

routes.get("/", async (req, res) => {

  // E: create the context to be sent to the provider
  const context = {
    user: req.get("x-user")
  };

  // F: call the OpenFeature client at requesttime to evaluate the flag, with default value and the context
  const withCows = await featureFlags.getBooleanValue("with-cows", false, context);
  if (withCows) {
    res.send(cowsay.say({ text: "Hello, world from b-nova!" }));
  } else {
    res.send("Hello, world from b-nova!");
  }
});

app.listen(3333, () => {
  console.log("Server running at http://localhost:3333");
});
