/**
 * Point d'entrée du proxy local — délègue à proxy-server/ (SRP).
 */
import { startLocalProxyServer } from "./proxy-server/create-server.js";

startLocalProxyServer();
