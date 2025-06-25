import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const urls = [
        {
            api: "https://hikers.su/api",
            web: "https://hikers.su",
        },
        {
            api: "https://hikers.su/api",
            web: "localhost:3000",
        },
    ]

    const dateStr = new Date()
    const yyyy = dateStr.getFullYear()
    let mm: string | number = dateStr.getMonth() + 1
    let dd: string | number = dateStr.getDate()

    if (dd < 10) dd = "0" + dd
    if (mm < 10) mm = "0" + mm

    const formattedDate = yyyy + "-" + mm + "-" + dd

    const currentIdx = 0
    return [
        {
            url: `${urls[currentIdx].web}/`, // главная
            lastModified: formattedDate,
            priority: 1.0,
        },
    ]
}
