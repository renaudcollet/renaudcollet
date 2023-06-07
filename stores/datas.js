import { defineStore } from 'pinia'

import voca from 'voca';
// toAlphaNumeric(str) {
//   return str.replace(/[^0-9a-zA-Z_]/gi, '');
// },

export const useDatasStore = defineStore( 'datas', {
  state: () => ({
    datas: null,
    seo: null,
    agence: null,
    contact: null,
    projects: null,
    projectsHome: null,
    projectsFooterHome: null,
    legals: null,
    footer: null
  }),
  actions: {
    async fetchDatas(apiUrl) {
      // console.log('FECH DATAS')
      if (!this.datas) {
        const {data} = await useFetch(`${apiUrl}/contenus`)
        // console.log('datas from store', data.value);
        if (data.value) {
          this.datas = data
          this.seo = data.value.contenus.find((item) => item.structure_name === 'SEO')
          this.contact = data.value.contenus.find((item) => item.structure_name === 'CONTACT')
          this.agence = data.value.contenus.find((item) => item.structure_name === "AGENCE")
          this.legals = data.value.contenus.find((item) => item.structure_name === "LEGAL")
          this.footer = data.value.contenus.find((item) => item.structure_name === "FOOTER")

          this.projects = []

          const aContenus = data.value.contenus
          const nbContenus = aContenus.length
          for (let i = 0; i < nbContenus; i++) {
            const contenu = aContenus[i];
            if (contenu.structure_name === 'PROJET') {
              contenu.slug = voca.slugify(contenu.name)
              this.projects.push(contenu)
            } 
          }

          // console.log('this.projects', this.projects);

          this.projectsHome = this.projects.slice(0, 5)
          this.projectsFooterHome = this.projects.slice(5, 11)
        }
      }
    }
  }
})
