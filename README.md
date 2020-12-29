# Auto Download Facebook Stickers

This is small tool to help you download all stickers packs from Facebook.

##  How to use?

### STEP 1: Fork this project

### STEP 2: Clone your forked project to you local disk

### STEP 3: Run `npm install` to install some requirement packages

### STEP 4: Preparing stickers data from facebook.com

Open facebook.com in chrome (also you must login to your account), paste the following code to console:

```
async function getStickers(packID) {
	var stickerSize = 128;
	var numMRUStickers = 40;

	var qs = `&variables={"stickerWidth":${stickerSize},"stickerHeight":${stickerSize},"packID":"${packID}","feedbackID":"","hasNoFeedbackID":true,"numMRUStickers":${numMRUStickers}}`
	var finalURL = "https://www.facebook.com/api/graphql/?av=451090751993359&__user=100001258748155&__a=1&__dyn=7AgSWohFoO5A9UrJDzk2m3mbG78V4WoaEGbxG3Kq2i5U4e2CEdFojyV8C6UnGiidxiVUmxa16xq2WdxK4ohyVfg8UcHzaw9a7oqx66E4y2e250Wwxxm0wpE5u1wKEtwMwhodQ3-bwFwXwl8swaq22i3K7Uy11xmfz8C1Uy82xwJz9XAy8aEaoB0nEO3a13wLwBgK7qxR0hU5W1ywnGwWwgEiK2q2KfxW2G1txe3C0D85a2W5oCbxa3CUy4o8EnwhE25xW5oC&__csr=&__req=7s&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1&__ccg=EXCELLENT&__rev=1003139049&__s=cci7h4%3Afkuq37%3Adv9a22&__hsi=6910755078976493515-0&__comet_req=0&cquick=jsc_c_k&cquick_token=AQ7m8Dei9esQaLj3MWM&ctarget=https%253A%252F%252Fwww.facebook.com&fb_dtsg=AQFm446jEIVE%3AAQGGXlj9Isc4&jazoest=21930&__spin_r=1003139049&__spin_b=trunk&__spin_t=1608979137&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=StickersFlyoutPackQuery&server_timestamps=true&doc_id=3829078343831521" + encodeURI(qs);
	var a1 = fetch(finalURL, {
		method: "post",
	});

	return new Promise((resolve, reject) => {
		return a1.then(stream => stream.json())
			.then(response => {
				if (
					response &&
					response.data &&
					response.data.node &&
					response.data.node.stickers &&
					response.data.node.stickers.edges
				) {
					resolve(response.data.node.stickers);
				} else {
					resolve(null);
				}
			})
			.catch(err => reject(err));
	})
}

(function start() {
	var count = 500;
	var size = 0;
	var qs = `&variables={"count":${count},"size":${size}}`;

	var a1 = fetch("https://www.facebook.com/api/graphql/?av=451090751993359&__user=100001258748155&__a=1&__dyn=7AgSWohFoO5A9UrJDzk2m3mbG78V4WoaEGbxG3Kq2i5U4e2CEdFojyV8C6UnGiidxiVUmxa16xq2WdxK4ohyVfg8UcHzaw9a7oqx66E4y2e250Wwxxm0wpE5u1wKEtwMwhodQ3-bwFwXwl8swaq22i3K7Uy11xmfz8C1Uy82xwJz9XAy8aEaoB0nEO3a13wLwBgK7qxR0hU5W1ywnGwWwgEiK2q2KfxW2G1txe3C0D85a2W5oCbxa3CUy4o8EnwhE25xW5oC&__csr=&__req=8n&__beoa=0&__pc=PHASED%3ADEFAULT&dpr=1&__ccg=EXCELLENT&__rev=1003139049&__s=hsh4qg%3Afkuq37%3Adv9a22&__hsi=6910755078976493515-0&__comet_req=0&cquick=jsc_c_k&cquick_token=AQ7m8Dei9esQaLj3MWM&ctarget=https%253A%252F%252Fwww.facebook.com&fb_dtsg=AQFm446jEIVE%3AAQGGXlj9Isc4&jazoest=21930&__spin_r=1003139049&__spin_b=trunk&__spin_t=1608979137&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=StickersStoreDialogStoreQuery&server_timestamps=true&doc_id=3760245170687374" + encodeURI(qs), {
		method: "post",
	});

	a1.then(stream => stream.json())
	.then(async (response) => {
		var rawPacks;
		var result = {};

		if (
			response &&
			response.data &&
			response.data.viewer &&
			response.data.viewer.sticker_store &&
			response.data.viewer.sticker_store.available_packs &&
			response.data.viewer.sticker_store.available_packs.edges
		) {
			rawPacks = response.data.viewer.sticker_store.available_packs.edges;
		}

		if (rawPacks && rawPacks.length) {
			await Promise.all(rawPacks.map(async (rawPack) => {
				if (rawPack.node) {
					result[rawPack.node.id] = rawPack.node;
					const stickers = await getStickers(rawPack.node.id);
					if (!result[rawPack.node.id].stickers) {
						result[rawPack.node.id].stickers = {};
					} else {
						result[rawPack.node.id].stickers = stickers;
					}
				}
			}))
		}

		console.save({packs: result}, "stickers-packs.json");
	})
	.catch(err => console.error(err));
})();
```

Save the result with `stickers-packs.json` file name, and in this project root folder.

### STEP 5: Run `node index.js`

Note: The download process will take long time, cause it's large size (>1GB).

Enjoy!
