import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import SmsOtpAuthService from "./service";

export default ModuleProvider(Modules.AUTH, {
  services: [SmsOtpAuthService],
}); 