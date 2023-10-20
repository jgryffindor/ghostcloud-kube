import { Address } from "@liftedinit/many-js";

export function parseAddress(content: any, optional: true): Address | undefined;
export function parseAddress(content: any, optional?: false): Address;
export function parseAddress(
  content: any,
  optional = false,
): Address | undefined {
  if (content instanceof Address) {
    return content;
  } else if (typeof content == "string") {
    return Address.fromString(content);
  } else if (Buffer.isBuffer(content)) {
    return new Address(content);
  } else if (content === undefined || content === null) {
    if (optional) {
      return undefined;
    }
  }

  throw new Error(
    `Invalid content type for address: ${JSON.stringify(content)}`,
  );
}
