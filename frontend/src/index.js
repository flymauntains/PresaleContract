import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/css/style.css";

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { global } from "./config/global";
import { staticConfig } from "./components/static";


const WalletTheme = {
  colors: {
    modalBackground: 'linear-gradient(to right, #4250b5, #8b2eb0, #e15897)',
    modalText: 'white'
  },
}

const WalletAvatar = () => {
  return <img
    src={global.PROJECT_TOKEN.logo}
    alt="avatar"
    width={128}
    height={128}
    style={{ borderRadius: 999 }}
  />;
};

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    global.chain,
  ],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: staticConfig.PROJECT,
  projectId: staticConfig.PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} avatar={WalletAvatar} theme={WalletTheme}>
        <App />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);
