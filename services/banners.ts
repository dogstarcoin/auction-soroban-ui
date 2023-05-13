
import { Banner } from '../models/Banner'

export const getBanners =  () : Banner[] => {

    const banners = [
        {
            id :1,
            name:  "Diamond", 
            size: "300x600",
            feature: "Will be shown in the header of all screens.",
            feature2: "All round "

        } ,
        {
            id :2,
            name:  "Hodl", 
            size: "320x50",
            feature: "Will be shown at the bottom of all screens 48h.",
            feature2: "All round "

        } , 
        {
            id :3,
            name:  "Only up", 
            size: "336x336",
            feature: "Will be shown at the leaderboard page. ",
            feature2: " All round "
        } 
    ]
    
    return banners
}
