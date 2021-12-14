<template>
  <div>
    <treeselect
      :multiple="true"
      :options="options"
      placeholder="Select your favourite(s)..."
      v-model="value"
      />
    <treeselect-value :value="value" />
  </div>
</template>

<script>
  export default {
    data: () => ({
      value: [],
      options: [ {
        id: 'fruits',
        label: 'Fruits',
        children: [ {
          id: 'apple',
          label: 'Apple 🍎阿斯顿发发阿斯蒂芬阿斯蒂芬阿斯蒂芬爱上的地方阿斯蒂芬阿斯蒂芬阿斯蒂芬阿斯蒂芬阿斯蒂芬爱上的地方阿萨德',
          isNew: true,
          children:[
            {
              id:"panyapple",
              label:"panyapple",
            }
          ]
        }, {
          id: 'grapes',
          label: 'Grapes 🍇',
        }, {
          id: 'pear',
          label: 'Pear 🍐',
        }, {
          id: 'strawberry',
          label: 'Strawberry 🍓',
        }, {
          id: 'watermelon',
          label: 'Watermelon 🍉',
        } ],
      }, {
        id: 'vegetables',
        label: 'Vegetables',
        children: [ {
          id: 'corn',
          label: 'Corn 🌽',
        }, {
          id: 'carrot',
          label: 'Carrot 🥕',
        }, {
          id: 'eggplant',
          label: 'Eggplant 🍆',
        }, {
          id: 'tomato',
          label: 'Tomato 🍅',
        } ],
      } ],
    }),
  }
</script>
