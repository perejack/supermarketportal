export interface Branch {
  name: string;
  address: string;
  hours?: string;
}

export interface BranchCounty {
  county: string;
  branches: Branch[];
}

export const QUICKMART_BRANCHES: BranchCounty[] = [
  {
    county: "Nairobi County",
    branches: [
      { name: "Buru Buru", address: "Buru Buru Phase 3, Mumias Rd.", hours: "24 Hrs" },
      { name: "Chaka", address: "Argwings Kodhek Rd, Nairobi", hours: "24 Hrs" },
      { name: "Donholm", address: "Outering Rd, Nairobi", hours: "24 Hrs" },
      { name: "EBP", address: "Eastern By-Pass, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "EBP 2", address: "Eastern By-Pass, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Embakasi", address: "Road to Utawala Academy, Nairobi", hours: "24 Hrs" },
      { name: "Fedha", address: "Fedha road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Jipange", address: "Thika road, Nairobi", hours: "24 Hrs" },
      { name: "Kahawa Sukari", address: "Kahawa sukari avenue, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Kahawa West", address: "Kahawa station road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Kikuyu Road", address: "Kikuyu road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Kilimani", address: "Kilimani road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Lavington", address: "Gitanga road, Nairobi", hours: "24 Hrs" },
      { name: "Mfangano", address: "Hakati road, Nairobi", hours: "24 Hrs" },
      { name: "Mombasa Road", address: "Mombasa road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "OTC", address: "Landhies Road, Nairobi", hours: "24 Hrs" },
      { name: "Outering", address: "Outer Ring Road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Pioneer", address: "Moi Avenue, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Pipeline", address: "Outer Ring Road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Roysambu", address: "Kamiti Road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Ruai", address: "Kangundo Road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "T-Mall", address: "Mai Mahiu Road, Lang'ata", hours: "07:00AM – 09:30PM" },
      { name: "Tom Mboya", address: "Tom Mboya Street, Nairobi", hours: "24 Hrs" },
      { name: "Utawala Express", address: "Eastern By-Pass, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Utawala Main", address: "Eastern By-Pass, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Waiyaki", address: "Waiyaki Way, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Westlands", address: "Ring Road, Parklands", hours: "07:00AM – 09:30PM" },
    ],
  },
  {
    county: "Mombasa County",
    branches: [
      { name: "Bandari", address: "Haile Selasie Road, Mombasa", hours: "07:00AM – 09:30PM" },
      { name: "Nyali", address: "Nyali area", hours: "24 Hrs" },
      { name: "Likoni", address: "Likoni area", hours: "Recently opened" },
    ],
  },
  {
    county: "Kiambu County",
    branches: [
      { name: "Chania", address: "Gatitu Rd, Kiambu", hours: "07:00AM – 09:30PM" },
      { name: "Kiambu Road", address: "Kiambu road, Kiambu", hours: "07:00AM – 09:30PM" },
      { name: "Ruaka", address: "Limuru Road, Kiambu", hours: "07:00AM – 09:30PM" },
      { name: "Ruiru", address: "Ruiru/ Kamiti Road, Kiambu", hours: "07:00AM – 09:30PM" },
    ],
  },
  {
    county: "Kisumu County",
    branches: [
      { name: "Kondele", address: "Kondele by-pass, Kisumu", hours: "07:00AM – 09:30PM" },
      { name: "Mayfair", address: "Angawe avenue, Kisumu", hours: "07:00AM – 09:30PM" },
      { name: "Nyalenda", address: "Awour Otieno Road, Kisumu", hours: "07:00AM – 09:30PM" },
      { name: "Oginga Odinga", address: "Oginga Odinga Road, Kisumu", hours: "07:00AM – 09:30PM" },
    ],
  },
  {
    county: "Kajiado County",
    branches: [
      { name: "Kiserian", address: "Magadi road, Nairobi", hours: "07:00AM – 09:30PM" },
      { name: "Kitengela", address: "Nairobi / Namanga, Kajiado", hours: "07:00AM – 09:30PM" },
      { name: "Milele Ngong", address: "Ngong road, Kajiado", hours: "07:00AM – 09:30PM" },
      { name: "Rongai Express", address: "Magadi Road, Nairobi", hours: "24 Hrs" },
      { name: "Rongai Main", address: "Magadi Road, Nairobi", hours: "07:00AM – 09:30PM" },
    ],
  },
  {
    county: "Machakos County",
    branches: [
      { name: "Machakos Express", address: "Near Machakos / Kitui road, Machakos", hours: "07:00AM – 09:30PM" },
      { name: "Machakos Pioneer", address: "Machakos Wote road, Machakos", hours: "07:00AM – 09:30PM" },
      { name: "Mlolongo Highway", address: "Near Machakos road, Machakos", hours: "07:00AM – 09:30PM" },
    ],
  },
  { county: "Uasin Gishu County (Eldoret)", branches: [{ name: "Eldoret", address: "Eldo Center Mall, Eldoret", hours: "07:00AM – 09:30PM" }] },
  { county: "Kakamega County", branches: [{ name: "Kakamega", address: "Kisumu / Kakamega road, Kakamega", hours: "07:00AM – 09:30PM" }] },
  { county: "Kericho County", branches: [{ name: "Kericho", address: "Tengecha la harambee road, Kericho", hours: "07:00AM – 09:30PM" }] },
  { county: "Kisii County", branches: [{ name: "Kisii", address: "Echiro mall, Kisii", hours: "07:00AM – 09:30PM" }] },
  { county: "Trans-Nzoia County", branches: [{ name: "Kitale", address: "Mak asembo street, Kitale", hours: "07:00AM – 09:30PM" }] },
  { county: "Kitui County", branches: [{ name: "Kitui", address: "Biashara Street, Kitui", hours: "07:00AM – 09:30PM" }] },
  { county: "Laikipia County", branches: [{ name: "Nanyuki", address: "Nyeri/ Nanyuki Road, Laikipia", hours: "07:00AM – 09:30PM" }] },
  {
    county: "Nakuru County",
    branches: [
      { name: "Shabab", address: "Shabab, Nakuru", hours: "07:00AM – 09:30PM" },
      { name: "Naivasha", address: "Metro Hypermarket", hours: "New" },
    ],
  },
  {
    county: "Kilifi County",
    branches: [
      { name: "Mtwapa Chap Chap", address: "Mombasa/ Malindi road, Mtwapa", hours: "24 Hrs" },
      { name: "Mtwapa Mall", address: "Mombasa/ Malindi Road, Mtwapa", hours: "07:00AM – 09:30PM" },
    ],
  },
  {
    county: "Recently Opened Branches (2025-2026)",
    branches: [
      { name: "Elgon View (Eldoret)", address: "Basic Elgon View along Kisumu Road", hours: "Opened April 2026" },
      { name: "Pioneer (Eldoret)", address: "Pioneer Business Center, Kisumu–Eldoret Road", hours: "New" },
      { name: "Highway Mlolongo", address: "Next to Family Bank, Machakos", hours: "New" },
    ],
  },
];

export const NAIVAS_BRANCHES: BranchCounty[] = [
  {
    county: "Nairobi County",
    branches: [
      { name: "HQ", address: "Sameer Industrial Park, Road C, Industrial Area" },
      { name: "Spur Mall", address: "Spur Mall, Thika Road" },
      { name: "Lifestyle", address: "Lifestyle Mall, Nairobi CBD" },
      { name: "Katani", address: "Katani Road" },
      { name: "Imara", address: "Imara Daima" },
      { name: "Greenspan", address: "Greenspan Mall, Donholm" },
      { name: "Embakasi Nyayo", address: "Nyayo Estate, Embakasi" },
      { name: "Aga Khan Walk", address: "Aga Khan Walk, Nairobi CBD" },
      { name: "Muindi Mbingu", address: "Muindi Mbingu Street, Nairobi CBD" },
      { name: "Embakasi", address: "Embakasi area" },
      { name: "Kangemi", address: "Kangemi area" },
      { name: "Waterfront", address: "Waterfront Mall, Karen" },
      { name: "Mountain Mall", address: "Mountain Mall, Thika Road" },
      { name: "Gateway Mall Syokimau", address: "Gateway Mall, Mombasa Road" },
      { name: "Airport View", address: "Near JKIA" },
      { name: "Kilimani", address: "Kilimani area" },
      { name: "Mountain View", address: "Waiyaki Way" },
      { name: "Kahawa West", address: "Kahawa West area" },
      { name: "Kamakis, Eastern Bypass", address: "Kamakis area" },
      { name: "Prestige", address: "Prestige Plaza, Ngong Road" },
      { name: "Lavington", address: "Lavington Curve Mall" },
      { name: "Ngong", address: "Ngong area" },
      { name: "Qwetu", address: "Near Qwetu Student Residences" },
      { name: "Tassia", address: "Tassia area" },
      { name: "Saika", address: "Saika area" },
      { name: "Langata", address: "Langata area" },
      { name: "Utawala", address: "Utawala area" },
      { name: "Capital Centre", address: "Capital Centre, Mombasa Road" },
      { name: "South C", address: "South C area" },
      { name: "Development House", address: "Moi Avenue, Nairobi CBD" },
      { name: "Moi Avenue", address: "Moi Avenue, Nairobi CBD" },
      { name: "Riruta", address: "Riruta area" },
      { name: "Githurai 45", address: "Githurai 45 area" },
      { name: "Githurai 44", address: "Githurai 44 area" },
      { name: "Buruburu", address: "Buruburu area" },
      { name: "Umoja", address: "Umoja area" },
      { name: "Ruaraka", address: "Ruaraka area" },
      { name: "Ngong-Homeground", address: "Ngong area" },
      { name: "Greenhouse", address: "Greenhouse Mall, Ngong Road" },
      { name: "Ronald Ngala", address: "Ronald Ngala Street, Nairobi CBD" },
      { name: "Komarock", address: "Komarock area" },
      { name: "Kasarani", address: "Kasarani area" },
      { name: "Hazina", address: "Hazina area" },
      { name: "Eastgate", address: "Eastgate Mall, Donholm" },
      { name: "Westlands", address: "Westlands area" },
    ],
  },
  {
    county: "Mombasa County",
    branches: [
      { name: "Bombolulu", address: "Bombolulu area" },
      { name: "Digo", address: "Digo Road, Mombasa CBD" },
      { name: "Mwembe Tayari", address: "Mwembe Tayari area" },
      { name: "Likoni", address: "Likoni area" },
      { name: "Bamburi", address: "Bamburi area" },
      { name: "Nyali Super Centre", address: "Nyali area" },
    ],
  },
  {
    county: "Nakuru County",
    branches: [
      { name: "Safari Center", address: "Safari Center, Naivasha" },
      { name: "Nakuru Midtown", address: "Nakuru CBD" },
      { name: "Nakuru Westside", address: "Westside Mall, Nakuru" },
      { name: "Nakuru Downtown", address: "Nakuru CBD" },
      { name: "Nakuru Super Centre", address: "Nakuru CBD" },
      { name: "Naivasha Ndogo", address: "Naivasha town" },
      { name: "Naivasha Supermarket Kubwa", address: "Naivasha town" },
    ],
  },
  {
    county: "Kiambu County",
    branches: [
      { name: "Kiambu Town", address: "Kiambu town" },
      { name: "Ananas Mall", address: "Ananas Mall, Thika" },
      { name: "Thika Town", address: "Thika town" },
      { name: "Juja City Mall", address: "Juja City Mall" },
      { name: "Limuru Town", address: "Limuru town" },
      { name: "Ciata Mall Kiambu Road", address: "Ciata Mall, Kiambu Road" },
    ],
  },
  {
    county: "Kisumu County",
    branches: [
      { name: "Kisumu Simba", address: "Kisumu CBD" },
      { name: "Kisumu Mega", address: "Mega City Mall, Kisumu" },
      { name: "Kisumu CBD", address: "Kisumu CBD" },
    ],
  },
  {
    county: "Eldoret (Uasin Gishu County)",
    branches: [
      { name: "Eldoret Zion", address: "Zion Mall, Eldoret" },
      { name: "Eldoret Referral", address: "Near Eldoret Referral Hospital" },
      { name: "Eldoret Sokoni", address: "Eldoret town" },
    ],
  },
  {
    county: "Machakos County",
    branches: [
      { name: "Supercentre Machakos", address: "Machakos town" },
      { name: "Machakos Old", address: "Machakos town" },
      { name: "Athi River", address: "Athi River", hours: "Recently opened, 113th branch" },
    ],
  },
  {
    county: "Embu County",
    branches: [
      { name: "Pearl Centre", address: "Embu town" },
      { name: "Embu", address: "Embu town" },
    ],
  },
  {
    county: "Kajiado County",
    branches: [
      { name: "Maiyan Mall", address: "Ongata Rongai" },
      { name: "Kitengela", address: "Kitengela town" },
    ],
  },
  { county: "Bungoma County", branches: [{ name: "Supermarket Bungoma", address: "Bungoma town" }] },
  { county: "Nandi County", branches: [{ name: "Supermarket Kapsabet", address: "Kapsabet town" }] },
  { county: "Kericho County", branches: [{ name: "Supermarket Kericho", address: "Kericho town" }] },
  { county: "Kisii County", branches: [{ name: "Supermarket Kisii", address: "Kisii town" }] },
  { county: "Kitui County", branches: [{ name: "Supermarket Kitui", address: "Kitui town" }] },
  { county: "Kwale County", branches: [{ name: "Supermarket Ukunda", address: "Ukunda town" }] },
  {
    county: "Kilifi County",
    branches: [
      { name: "Supermarket Kilifi", address: "Kilifi town" },
      { name: "Supermarket Malindi", address: "Malindi town" },
    ],
  },
  { county: "Narok County", branches: [{ name: "Supermarket Narok", address: "Narok town" }] },
  { county: "Nyeri County", branches: [{ name: "Supermarket Nyeri", address: "Nyeri town" }] },
];

export const CARREFOUR_BRANCHES: BranchCounty[] = [
  {
    county: "Nairobi County",
    branches: [
      { name: "The Hub Karen", address: "The first Carrefour hypermarket in Kenya (Karen)" },
      { name: "Two Rivers Mall", address: "Hypermarket, Limuru Road" },
      { name: "Thika Road Mall (TRM)", address: "Hypermarket, Thika Road" },
      { name: "The Junction Mall", address: "Hypermarket, Ngong Road" },
      { name: "Sarit Centre", address: "Hypermarket, Westlands" },
      { name: "Galleria Mall", address: "Hypermarket, Lang'ata Road" },
      { name: "Village Market", address: "Market, Limuru Road" },
      { name: "Carrefour Mega", address: "Hypermarket, Mombasa Road" },
      { name: "Westgate Mall", address: "Market, Westlands" },
      { name: "NextGen Mall", address: "Market, Mombasa Road" },
      { name: "Garden City Mall", address: "Hypermarket, Thika Road" },
      { name: "Southfield Mall", address: "Market, Embakasi" },
      { name: "Valley Arcade", address: "Market, Lavington" },
      { name: "Comesa Mall", address: "Market, Eastleigh" },
      { name: "Business Bay Square (BBS) Mall", address: "Market, Eastleigh" },
      { name: "GTC Mall", address: "Market, Westlands" },
      { name: "Beacon Mall", address: "Recently opened in 2025" },
    ],
  },
  {
    county: "Mombasa County",
    branches: [
      { name: "City Mall Nyali", address: "Hypermarket, Nyali" },
      { name: "Center Point Mall", address: "Market, Mombasa CBD" },
      { name: "Likoni", address: "Recently opened" },
    ],
  },
  { county: "Kwale County", branches: [{ name: "Diani Centre Point Plaza", address: "Market, Diani" }] },
  {
    county: "Kisumu County",
    branches: [
      { name: "Mega City Mall", address: "Hypermarket, Kisumu" },
      { name: "United Mall", address: "Market, Kisumu" },
    ],
  },
  { county: "Kilifi County", branches: [{ name: "Watamu", address: "Recently opened in 2025" }] },
];

export function countBranches(counties: BranchCounty[]): number {
  return counties.reduce((sum, county) => sum + county.branches.length, 0);
}

export function flattenBranchNames(counties: BranchCounty[]): string[] {
  return counties.flatMap((county) => county.branches.map((branch) => branch.name));
}
