const got = require('@/utils/got');

const cheerio = require('cheerio');


module.exports = async (ctx) => {
    const baseUrl = 'https://news.21food.cn';
    const indexUrl = `${baseUrl}/list-1.html`;

    const { data: response } = await got(String(indexUrl));
    const $ = cheerio.load(response);

    const list = $('#conta_iner, div.el_li_l ')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('a').first();
            return {
                title: a.text(),
                link: `${baseUrl}${a.attr('href')}`
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);

                item.description = $('.ta_tle_mer').first().html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `食研汇最新新闻`,
        link: String(baseUrl),
        item: items,
    };
};
