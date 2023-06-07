<script setup>
const props = defineProps({
  error: Object
})

await navigateTo(`/error/${props.error.statusCode}` )
</script>

