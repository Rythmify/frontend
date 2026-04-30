import { useNavigate } from "react-router-dom";
import DropZone from "@/components/Upload/DropZone";

const BENEFITS = [
  {
    brand: "Splice",
    description: "Get 2 free months of Splice Sounds+ royalty-free samples",
    save: "Save $25.98",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-splice-back.5c615c72.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-splice.b3f7f14f.svg",
  },
  {
    brand: "Groover",
    description: "Get 20% off all campaigns on Groover.co and free hype add-on",
    save: "Save $21",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-groover-back.0117f664.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-groover.828d0c91.svg",
  },
  {
    brand: "Native Instruments",
    description: "Get 1 month free of Native Instrument's 360 Pro suite",
    save: "Save $50",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-native-back.75f49e1a.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-native.5f4fae17.svg",
  },
  {
    brand: "Output Arcade",
    description: "Get 3 free months of Output's Arcade plug-in and samples",
    save: "Save $39",
    bgImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-arcade-back.fe7f4eaf.svg",
    overlayImage: "https://assets.web.soundcloud.cloud/_next/static/media/upsell-benefit-arcade.387a3c3f.svg",
  },
];

const HOW_IT_WORKS = [
  {
    title: "Upload",
    description: "Artist uploads tracks to Rythmify and other platforms",
    icon: (
     <svg width="86" height="86" fill="none" viewBox="0 0 69 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g clip-path="url(#upload-a)"><path d="M26.346 8.282c.06-.13.13-.26.2-.38.16-.31.33-.61.51-.9.08-.13.15-.25.23-.38.22-.33.44-.66.68-.97.04-.05.08-.11.12-.17.28-.36.57-.69.88-1.02.08-.09.17-.17.26-.26.23-.23.47-.46.71-.67.11-.09.21-.18.32-.27.27-.22.54-.42.82-.61.08-.06.16-.12.24-.17.26-.17.53-.32.81-.47.14-.08.26-.16.4-.23.41-.21.84-.4 1.27-.56l-13.92 5.19c-.43.16-.86.35-1.27.56-.14.07-.27.16-.4.23-.25.14-.5.27-.74.42-.02.02-.05.04-.07.05-.08.05-.16.11-.24.17-.28.19-.55.4-.82.61-.11.09-.21.18-.32.27-.24.21-.48.44-.71.67-.09.09-.18.17-.26.26-.3.32-.6.66-.88 1.02-.04.05-.08.11-.12.17a13.928 13.928 0 0 0-.91 1.34c-.18.29-.35.59-.51.9-.07.13-.14.25-.2.38-.21.43-.13.27-.31.73M56.096 51.772l-17.09-3.93-9.77-2.24c-5.7-1.31-10.64-6.41-13.08-12.75-1.02-2.66-1.6-5.55-1.61-8.46-.01-5.97 2.38-10.7 6.07-13.09.65-.42 1.34-.77 2.06-1.04l-13.92 5.19c-.72.27-1.41.62-2.06 1.04-3.69 2.39-6.08 7.12-6.06 13.09 0 2.91.58 5.8 1.61 8.46 2.43 6.34 7.38 11.44 13.08 12.75l9.77 2.24 17.09 3.93c1.94.45 3.77.32 5.4-.29l13.92-5.19c-1.63.61-3.46.74-5.4.29h-.01Z" stroke="currentColor" stroke-miterlimit="10"></path><path d="M58.336 22.822c-1.12-10.48-8.3-20.01-16.99-22.01-6.98-1.6-12.96 2.11-15.61 8.8-6.44.4-11.21 6.36-11.19 14.78.02 9.86 6.59 19.35 14.68 21.21l9.77 2.24v-5.43l4.88 1.12v-5.43l4.88 1.12v5.43l-4.88-1.12v5.43l12.21 2.81c6.74 1.55 12.19-3.85 12.18-12.07-.01-7.25-4.29-14.28-9.94-16.88h.01Zm-9.06 8.9-5.39-7.79v14.18l-4.88-1.12v-14.18l-5.36 5.31-3.46-5 7.65-7.59c1.87-1.85 4.83-1.76 7.33 1.85l7.56 10.93-3.44 3.41h-.01ZM4.836 43.022l12.13-4.52c-.77-1.14-1.46-2.36-2.05-3.65l-12.13 4.52c.58 1.29 1.27 2.51 2.04 3.65h.01ZM34.126 52.162l4.88 1.12v5.43l-4.88-1.12v-5.43ZM39.006 66.502l3.45.79v3.84l-3.45-.79v-3.84Z" fill="#fff"></path><path d="M58.336 22.822c-1.11-10.48-8.3-20.01-16.99-22.01-6.98-1.6-12.96 2.11-15.61 8.8-6.44.4-11.21 6.36-11.19 14.78.02 9.86 6.59 19.35 14.68 21.21l9.77 2.24 4.88 1.12 12.22 2.81c6.74 1.55 12.19-3.85 12.18-12.07-.01-7.25-4.29-14.28-9.94-16.88Z" stroke="currentColor" stroke-miterlimit="10"></path></g><defs><clipPath id="upload-a"><path fill="#fff" transform="translate(.256 .072)" d="M0 0h68.4v71.06H0z"></path></clipPath></defs></svg>
    ),
  },
  {
    title: "Get Heard",
    description: "Track gets recommended to the right listeners",
    icon: (
     <svg width="86" height="86" fill="none" viewBox="0 0 98 101" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M37.521 12.1405C37.614 11.9546 37.707 11.7802 37.8116 11.5942C38.044 11.1642 38.2765 10.7341 38.5322 10.3273C38.6368 10.1529 38.7531 9.96695 38.8577 9.7926C39.1599 9.31604 39.4853 8.86272 39.8224 8.42103C39.8805 8.33966 39.9387 8.2583 39.9968 8.18856C40.392 7.67713 40.8104 7.20056 41.2405 6.74725C41.3567 6.61939 41.4846 6.50315 41.6124 6.37529C41.9379 6.04984 42.275 5.72438 42.6237 5.42217C42.7748 5.29431 42.9259 5.16645 43.077 5.03859C43.449 4.73638 43.8442 4.44579 44.2394 4.16683C44.3556 4.08546 44.4602 4.0041 44.5764 3.92274C44.9484 3.67864 45.332 3.46942 45.7272 3.24857C45.9248 3.14396 46.0991 3.0161 46.2967 2.92311C46.8779 2.6209 47.4823 2.35356 48.0984 2.12109L28.3268 9.50201C27.7107 9.73448 27.1063 10.0018 26.5251 10.304C26.3275 10.4086 26.1416 10.5249 25.9556 10.6295C25.6069 10.8271 25.2466 11.0131 24.9095 11.2339C24.8746 11.2572 24.8397 11.2804 24.8049 11.3037C24.6886 11.385 24.584 11.4664 24.4678 11.5477C24.0726 11.8267 23.689 12.1057 23.3054 12.4195C23.1543 12.5474 23.0032 12.6752 22.8521 12.8031C22.5034 13.1053 22.1663 13.4191 21.8409 13.7562C21.713 13.8841 21.5852 14.0003 21.4689 14.1282C21.0389 14.5815 20.6204 15.0697 20.2252 15.5695C20.1671 15.6508 20.109 15.7322 20.0509 15.802C19.7138 16.2436 19.3999 16.697 19.0861 17.1735C18.9699 17.3479 18.8653 17.5222 18.7606 17.7082C18.5049 18.1266 18.2725 18.5451 18.04 18.9868C17.947 19.1728 17.8424 19.3471 17.761 19.5331C17.4588 20.1491 17.5751 19.9167 17.3193 20.5676" stroke="currentColor" stroke-miterlimit="10"></path><path d="M79.7842 73.9191L55.5027 68.3399L41.6242 65.155C33.5343 63.2953 26.5021 56.0538 23.0499 47.0456C21.597 43.268 20.7717 39.1649 20.7717 35.0269C20.7601 26.5534 24.1541 19.8234 29.3847 16.4293C30.303 15.8249 31.291 15.3367 32.3138 14.9531L12.5423 22.334C11.5194 22.7176 10.5314 23.2174 9.61313 23.8102C4.37093 27.2043 0.976872 33.9227 1.00012 42.3962C1.00012 46.5342 1.82539 50.6256 3.27832 54.4149C6.7305 63.4231 13.7627 70.6646 21.8527 72.5243L35.7311 75.7092L60.0126 81.2884C62.7674 81.9161 65.3711 81.7417 67.6841 80.87L87.4557 73.4891C85.1426 74.3492 82.539 74.5352 79.7842 73.9075V73.9191Z" stroke="currentColor" stroke-miterlimit="10"></path><path d="M82.9689 32.7945C81.3881 17.9164 71.1827 4.3634 58.8385 1.52727C48.9237 -0.750936 40.4269 4.52613 36.6725 14.0225C27.5248 14.5805 20.7483 23.054 20.7715 35.0146C20.7948 49.0209 30.1401 62.5041 41.6241 65.1427L79.784 73.9068C89.3618 76.1036 97.1031 68.4437 97.0798 56.7621C97.0566 46.4637 90.9775 36.4791 82.9573 32.7829L82.9689 32.7945Z M36.4755 35.0272L42.636 39.1071C42.1943 40.653 41.927 42.3384 41.9037 44.1401L35.2783 42.6058C35.3132 39.8626 35.7316 37.3287 36.4755 35.0156V35.0272Z M41.4957 26.6797L46.1334 32.968C44.9013 34.2466 43.8901 35.7925 43.1811 37.5709L37.0322 33.4911C38.1016 30.8409 39.6243 28.5394 41.4957 26.6797Z M82.4927 54.1828L75.8789 52.6485V51.2305L82.4927 52.7531V54.1828Z M76.5647 34.7812C78.1688 37.1524 79.4939 39.7212 80.4935 42.4411L74.4028 43.9987C73.7519 42.2087 72.8801 40.5 71.834 38.9076L76.5531 34.7812H76.5647Z M68.5679 26.4453C71.1599 28.3167 73.4962 30.6298 75.4839 33.2567L70.7647 37.3714C69.4164 35.593 67.8472 34.0355 66.127 32.7569L68.5795 26.4569L68.5679 26.4453Z M59.8853 22.2617C62.4076 22.9359 64.8369 24.0401 67.0918 25.4698L64.6393 31.7465C63.1282 30.805 61.5126 30.0727 59.8271 29.6078L59.8853 22.2617Z M58.3034 21.9049L58.2453 29.251C56.2809 28.9023 54.3979 28.9255 52.666 29.3091L50.0391 21.9514C52.5962 21.3702 55.3859 21.3354 58.2917 21.9049H58.3034Z M48.6099 22.3671L51.2252 29.6899C49.7607 30.1897 48.424 30.9452 47.2384 31.9332L42.6006 25.6565C44.3674 24.1687 46.3898 23.0529 48.6099 22.3555V22.3671Z M67.5446 44.6637C68.0328 44.7799 68.5094 45.21 68.707 45.7795C68.7884 46.0004 68.8116 46.2096 68.8116 46.4072C68.8 46.8489 68.6024 47.2325 68.2653 47.4185L60.7449 51.6029C60.5705 51.7075 60.3729 51.7773 60.1753 51.8354C59.7569 51.94 59.3152 51.94 58.8851 51.8354C57.653 51.5564 56.4907 50.4871 55.9676 49.0341C55.7933 48.5459 55.7119 48.0577 55.7119 47.6044C55.7119 46.2212 56.4209 45.0589 57.6414 44.745C57.8506 44.6986 58.0599 44.6637 58.2691 44.6637L67.2773 44.6172C67.3703 44.6172 67.4633 44.6172 67.5446 44.6521V44.6637Z" fill="#fff" fill-rule="evenodd"></path><path d="M6.97521 61.4791L24.2012 55.0513C23.097 53.4356 22.1206 51.6921 21.2954 49.8672L4.06934 56.295C4.8946 58.1199 5.87098 59.8634 6.97521 61.4791Z" fill="currentColor"></path><path d="M37.335 69.5586L45.8434 71.5113V80.9845L37.335 79.0317V69.5586Z" fill="currentColor"></path><path d="M55.2822 92.875L61.3264 94.2698V101L55.2822 99.605V92.875Z" fill="currentColor"></path><path d="M82.9689 32.7945C81.3881 17.9164 71.1827 4.3634 58.8385 1.52727C48.9237 -0.750936 40.4269 4.52613 36.6725 14.0225C27.5248 14.5805 20.7483 23.054 20.7715 35.0146C20.7948 49.0209 30.1401 62.5041 41.6241 65.1427L55.5026 68.3275L62.4302 69.9199L79.784 73.9068C89.3502 76.1036 97.1031 68.4438 97.0798 56.7621C97.0566 46.4637 90.9775 36.4791 82.9573 32.7829L82.9689 32.7945Z" stroke="currentColor" stroke-miterlimit="10"></path></svg>
    ),
  },
  {
    title: "Get Fans",
    description: "Listeners engage directly with the artist, and become fans.",
    icon: (
      <svg width="86" height="86" fill="none" viewBox="0 0 67 62" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="m62.22 30.076-2.2-.5c-.93-13.21-10.7-25.6-22.45-28.34-5.9-1.38-11.48-.16-15.75 3.42-6.03 1.89-10.4 6.85-12.07 13.66-.61.06-1.23.23-1.86.55-3.99 2.03-7.1 8.79-7.08 15.37.02 4.81 1.82 8.33 4.59 8.96l5.28 1.21c.3.07.6.1.91.1.74 0 1.49-.2 2.26-.59.41-.21.82-.49 1.21-.8l11.76 15.89c1.01 1.36 2.37 2.29 3.82 2.63.39.09.78.13 1.16.13.75 0 1.47-.18 2.12-.53l7.43-4.07c.27-.16.53-.32.77-.53l6.12-5.33c.77 1.26 1.81 2.1 3.02 2.38l5.28 1.21c.3.07.6.1.91.1.74 0 1.49-.2 2.26-.59 3.93-2 7.11-8.9 7.09-15.38-.02-4.81-1.82-8.32-4.59-8.96l.01.01ZM22.46 5.816c2.83-.84 5.87-.89 9.03-.15 7.7 1.79 14.49 7.94 18.3 15.71-.73-.33-1.49-.58-2.25-.76-2.53-.58-5.06-.26-7.12.92-.51.3-1.13.37-1.77.22-.69-.16-1.35-.55-1.91-1.14-2.01-2.09-4.41-3.51-6.94-4.09-2.51-.58-4.91-.27-6.94.85l-5.15 2.81c-.42-.28-.87-.48-1.35-.59l-.17-.04c.38-5.68 2.58-10.54 6.27-13.73v-.01Zm21.64 25.25v10.67l-1.76-.41v-10.67l1.76.41Zm2.64 6.6v-1.97l1.76.41v1.96l-1.76-.41v.01ZM35.3 26.646v14.81l-1.76-.41v-14.81l1.76.41Zm-6.17 3.7 1.76.41v4.58l-1.76-.41v-4.58Zm8.81 6.83v-5.04l1.76.41v5.04l-1.76-.41Zm19.5-8.2c-.45-.9-.97-1.79-1.6-2.63-1.19-1.6-2.6-2.92-4.14-3.93-1.37-3.22-3.25-6.2-5.48-8.8l4.64-2.52c4.32 4.96 7.26 11.42 7.82 18.15l-1.25-.29.01.02ZM19.46 7.036c-2.63 3.23-4.22 7.45-4.57 12.21l-3.81-.87c1.32-5.15 4.29-9.13 8.39-11.34h-.01Zm-6.2 35.73c-.67.34-1.3.47-1.9.42.18-.07.35-.13.54-.23 2.38-1.21 4.46-4.34 5.66-8.07l-3.62-.83c-1.2 3.73-3.28 6.86-5.66 8.07-.2.1-.4.18-.6.25l-1.99-.46c-2.12-.49-3.56-3.58-3.58-7.7-.02-6.04 2.84-12.41 6.37-14.22.58-.3 1.15-.45 1.68-.45.21 0 .42.02.62.07l5.28 1.21c2.12.49 3.56 3.58 3.58 7.7.02 6.04-2.84 12.42-6.38 14.22v.02Zm20.04 17.34c-.69.38-1.5.47-2.36.27-.14-.03-.27-.09-.4-.14l5.34-2.92c-.89-.42-1.74-1.1-2.43-2.03l-5.51 3.02s-.04-.04-.06-.07l-11.83-15.99c1.62-1.69 2.98-4.18 3.85-6.97.34.61.71 1.2 1.12 1.75l13.26 17.92c.99 1.33 2.31 2.24 3.72 2.6h-.01l-4.67 2.56h-.02Zm25.83-6.85c-.66.34-1.3.47-1.9.42.18-.07.35-.13.54-.23 2.38-1.21 4.46-4.34 5.66-8.07l-3.62-.83c-1.2 3.73-3.28 6.86-5.66 8.07-.2.1-.4.18-.6.25l-1.99-.46c-.92-.21-1.71-.91-2.32-1.98l6.37-5.54c3.7-3.22 4.53-9.08 2.48-14.44l3.85.88c2.16.49 3.56 3.51 3.58 7.7.02 6.04-2.84 12.42-6.38 14.22l-.01.01Z" fill="#fff"></path><path d="M8.2 22.536c-2.72 1.38-4.91 6.2-4.89 10.76.02 4.56 2.24 7.13 4.95 5.74 2.72-1.39 4.91-6.2 4.89-10.76-.02-4.56-2.24-7.12-4.96-5.74h.01Z" fill="#fff"></path></svg>
    ),
  },
  {
    title: "Get Paid",
    description: "Artist makes money from streams, merch, vinyl and more.",
    icon: (
      <svg width="86" height="86" fill="none" viewBox="0 0 56 58" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.68 52.793c3.21 2.84 7.43 4.3 12.08 4.3 3 0 6.19-.61 9.39-1.84 13.74-5.27 24.05-20.38 22.98-33.67-.41-5.08-2.4-9.34-5.77-12.33-3.23-2.87-5.33-4.85-6.93-5.86-5.21-3.28-12.26-3.6-19.36-.87C9.35 7.803-.96 22.913.11 36.203c.4 5.02 2.4 9.24 5.67 12.2l4.9 4.39Zm1.89-30.93 2.53-.97-.2-2.49c-.05-.68.47-1.45 1.16-1.72l6.33-2.43-.2-2.49c-.05-.68.47-1.45 1.16-1.72l1.28-.49c.7-.27 1.3.07 1.35.75l.2 2.49 6.33-2.43c.7-.27 1.31.06 1.36.75l.2 2.49 2.53-.97c.7-.27 1.31.07 1.36.75l.1 1.26c.05.68-.47 1.45-1.16 1.72l-1.28.49c-.7.27-1.3-.07-1.35-.75l-.2-2.49-18.98 7.28.6 7.44 17.72-6.8c.7-.27 1.31.07 1.36.75l.2 2.49 2.53-.97c.7-.27 1.3.06 1.36.75l.4 4.98c.05.68-.47 1.45-1.16 1.72l-2.53.97.2 2.49c.05.68-.47 1.45-1.16 1.72l-6.33 2.43.2 2.49c.05.68-.46 1.45-1.16 1.71l-1.28.49c-.7.27-1.31-.07-1.36-.75l-.2-2.49-6.33 2.43c-.7.27-1.31-.07-1.36-.75l-.2-2.49-2.53.97c-.7.27-1.31-.07-1.36-.75l-.1-1.26c-.05-.68.47-1.45 1.16-1.72l1.28-.49c.7-.27 1.3.07 1.35.75l.2 2.49 18.98-7.28-.6-7.44-17.72 6.8c-.7.27-1.31-.07-1.36-.75l-.2-2.49-2.53.97c-.7.27-1.31-.07-1.36-.75l-.4-4.98c-.05-.68.47-1.45 1.16-1.72l.01.01Zm28.04 26.99-2.64-2.31c-1.27 1.02-2.6 1.96-3.99 2.8l2.63 2.3c-.76.45-1.53.87-2.32 1.26l-2.61-2.29c-.95.48-1.91.91-2.9 1.29-6.33 2.43-12.27 2.32-16.92.18-.1-.09-.21-.17-.31-.26l-.03-.03c2 .69 4.17 1.04 6.44 1.04 3.01 0 6.2-.61 9.4-1.84 13.74-5.28 24.05-20.38 22.98-33.67-.21-2.63-.88-5.04-1.92-7.17l.09.08c3.11 2.76 4.96 6.72 5.34 11.46.78 9.67-4.75 20.35-13.23 27.16h-.01Z" fill="#fff"></path></svg>
    ),
  },
];

export function EmptyState() {
  const navigate = useNavigate();

  return (
    <div className="mt-2">
      <DropZone onUpload={() => navigate("/upload")} />

      <div className="mt-16 text-center">
        <h2 className="text-text-hover font-extrabold text-2xl mb-5 tracking-tighter">
          How Rythmify works for artists at any stage.
        </h2>
        <p className="text-text-hover  text-sm max-w-3xl mx-auto mb-12">
          Rythmify is the easiest way to get your music online, get actual people to listen to it,
          get feedback, grow your community, and get paid fairly for your plays.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {HOW_IT_WORKS.map(({ title, description, icon }) => (
            <div key={title} className="flex flex-col items-center gap-4">
              <div className="w-28 h-28 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <p className="text-text-hover font-extrabold text-2xl uppercase tracking-tighter mb-4">
                  {title}
                </p>
                <p className="text-text-hover text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artist Pro Membership Benefits */}
      <div className="mt-16 bg-[#1a1a1a] rounded-xl p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-text-hover font-extrabold text-xl tracking-tight flex items-center gap-2">
              Artist Pro Membership Benefits
              <span className="text-[13px] font-bold text-text border border-[#444] rounded-full px-2.5 py-0.5">
                Coming Soon
              </span>
            </h3>
            <p className="text-text text-sm mt-1 max-w-xl">
              Jump start your music career with Artist Pro and immediately unlock $100+ in premium music tools and services.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/premium")}
            className="shrink-0 px-4 py-1.5 rounded-full border border-[#444] text-text-hover text-sm font-semibold hover:border-[#666] transition-colors cursor-pointer"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {BENEFITS.map(({ brand, description, save, bgImage, overlayImage }) => (
            <div key={brand} className="flex flex-col rounded-lg overflow-hidden bg-[#111] cursor-pointer group">
              <div className="relative h-52 overflow-hidden">
                {bgImage ? (
                  <>
                    {/* Background photo — zooms on hover */}
                    <img
                      alt="Main"
                      loading="lazy"
                      decoding="async"
                      src={bgImage}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={{ color: "transparent" }}
                    />
                   
                    <div
                      className="absolute bg-black/70"
                      aria-label="Black cover"
                      style={{ width: "72%", height: "160%", top: "-30%", left: "-22%", transform: "rotate(-12deg)" }}
                    />
                    
                    <img
                      alt="Overlay"
                      loading="lazy"
                      decoding="async"
                      src={overlayImage!}
                      className="absolute top-30 left-3 w-20 object-contain"
                      style={{ color: "transparent" }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <span className="text-white font-bold text-lg opacity-60 group-hover:opacity-90 transition-opacity">
                      {brand}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3 flex-1">
                <p className="text-text-hover text-md font-bold leading-snug">{description}</p>
                <button
                  type="button"
                  onClick={() => navigate("/premium")}
                  className="mt-auto inline-block bg-[#1db954] text-white text-xs font-bold px-3 py-1.5 rounded-full w-fit cursor-pointer hover:bg-[#1ed760] transition-colors"
                >
                  {save}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
