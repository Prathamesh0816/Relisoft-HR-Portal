export const themes = {
  default: {
    label: 'Professional',
    heroTitle: 'Your workspace.',
    tagline: 'Your workspace. Your command.',
    banner: '/assets/professional-workspace.jpg',
    slides: [
      { image: '/assets/professional-workspace.jpg', title: 'Professional Workspace', tag: 'Where productivity meets design' },
      { image: '/assets/panchshil-business-park.jpg', title: 'Panchshil Business Park', tag: 'Our workplace' },
      { image: '/assets/trustage-madison.jpg', title: 'Trustage Madison', tag: 'Built for excellence' },
    ],
  },
  maharashtra: {
    label: 'Maharashtra Culture',
    heroTitle: 'गड आणि ग्रंथ',
    tagline: 'गड, ग्रंथ, आणि गौरव',
    banner: '/assets/raigad-fort.jpg',
    slides: [
      { image: '/assets/shivaji-maharaj.jpg', title: 'Chhatrapati Shivaji Maharaj', tag: 'Legacy of valor and leadership' },
      { image: '/assets/dagdusheth-ganpati.jpg', title: 'Dagdusheth Ganpati', tag: 'Epitome of faith and devotion' },
      { image: '/assets/raigad-fort.jpg', title: 'Raigad Fort', tag: 'Capital of the Maratha Empire' },
    ],
  },
  fun: {
    label: 'Cricket & Fun',
    heroTitle: 'Game. Movies. Fun.',
    tagline: 'Work hard, play hard',
    banner: '/assets/cricket-stadium.jpg',
    slides: [
      { image: '/assets/cricket-stadium.jpg', title: 'Cricket Stadium', tag: 'Game on!' },
      { image: '/assets/movies-entertainment.jpg', title: 'Movies & Fun', tag: 'Entertainment and leisure' },
    ],
  },
}

export function getTheme(name) {
  return themes[name] || themes.default
}
