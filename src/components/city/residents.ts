import type { CityPlotId } from '../../lib/city'
import bakerGrandma from '../../assets/city/residents/res-baker-grandma.webp'
import curlyToddler from '../../assets/city/residents/res-curly-toddler.webp'
import fisherGrandpa from '../../assets/city/residents/res-fisher-grandpa.webp'
import gardenerMom from '../../assets/city/residents/res-gardener-mom.webp'
import headphoneTeen from '../../assets/city/residents/res-headphone-teen.webp'
import hijabTeacher from '../../assets/city/residents/res-hijab-teacher.webp'
import knitGrandma from '../../assets/city/residents/res-knit-grandma.webp'
import lanternBoy from '../../assets/city/residents/res-lantern-boy.webp'
import postmanDad from '../../assets/city/residents/res-postman-dad.webp'
import readerGirl from '../../assets/city/residents/res-reader-girl.webp'

/** Easy Home faces. Eight plots and two walkers, each a different bust. */
export const RESIDENT_PORTRAIT: Record<CityPlotId, string> = {
  porch: bakerGrandma,
  lamps: lanternBoy,
  journal: readerGirl,
  hollow: fisherGrandpa,
  bench: postmanDad,
  gate: headphoneTeen,
  observatory: knitGrandma,
  lookout: gardenerMom,
}

export const RESIDENT_WALKER = {
  a: curlyToddler,
  b: hijabTeacher,
}
