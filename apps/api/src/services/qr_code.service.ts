import QRCode from "qrcode";

export default class QrCodeService {
	toPng(content: string, width = 512) {
		return QRCode.toBuffer(content, { type: "png", width, margin: 2, errorCorrectionLevel: "M" });
	}

	toSvg(content: string) {
		return QRCode.toString(content, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
	}
}
