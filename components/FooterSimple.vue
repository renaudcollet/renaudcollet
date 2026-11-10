<template>
  <footer class="footer" ref="footer">
    <div class="footer__top">
      <!-- <div class="footer__top__logo"></div> -->
      <!-- <NuxtLink to="/works" class="footer__top__more">Voir tous les projets</NuxtLink> -->
      <div class="footer__made-with" v-html="footerMadeWith" ref="madeWith"></div>
    </div>

    <div>
      <div>
        <a 
          v-if="linkedin"
          :href="linkedin"
          data-mouse-cursor="hover"
          target="_blank"
        >
          <img src="~/assets/svg/social-linkedin-white.svg" alt="Linkedin" class="footer__social__icon">
        </a>
      </div>
    </div>


    <div class="footer__since">
      {{footerSince}} - ©2004-{{ currentYear }}&nbsp;-&nbsp;<NuxtLink to="/legal" class="footer__legal" data-mouse-cursor="hover">Mentions légales</NuxtLink>
    </div>

  </footer>
</template>

<script setup>
import { useDatasStore, S_DATA_CONTACT } from '~/stores/datas';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_CONTACT);
const linkedin = storeDatas.contact.data.attributes.linkedin;
const footerSince = storeDatas.contact.data.attributes.footerSince;
const footerMadeWith = storeDatas.contact.data.attributes.made_with;

const madeWith = ref(null)

// Computed on the server and carried to the client in the payload, so hydration never
// sees two different years (a page cached by Nitro just before New Year, for instance)
const currentYear = useState('footer-current-year', () => new Date().getFullYear())

onMounted(() => {
  madeWith.value.querySelectorAll('a').forEach((el) => {
    el.setAttribute('target', '_blank')
  })
})
</script>
