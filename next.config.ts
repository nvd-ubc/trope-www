import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
	// Configure `pageExtensions` to include MDX files
	pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
	async headers() {
		return [
			{
				source: "/invite",
				headers: [
					{ key: "Cache-Control", value: "no-store" },
					{ key: "Pragma", value: "no-cache" },
					{ key: "Referrer-Policy", value: "no-referrer" },
					{ key: "X-Robots-Tag", value: "noindex" },
				],
			},
		];
	},
};

const withMDX = createMDX({
	// Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
