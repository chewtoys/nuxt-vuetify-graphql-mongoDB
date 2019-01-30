import { mount } from '@vue/test-utils'
import PressBox from '@/components/press/PressBox.vue'
import Vuetify from 'vuetify'
import Vue from 'vue'

Vue.use(Vuetify)

describe('PressBox', () => {
  test('makes two layouts', () => {
    const wrapper = mount(PressBox, {
      context: {
        props: {
          label: 'page',
          type: 'container',
          nodes: [
            {
              label: 'layout1',
              type: 'layout',
              nodes: [
                {
                  label: 'flex1.1',
                  type: 'flex'
                },
                {
                  label: 'flex1.2',
                  type: 'flex',
                  comp: 'helloWorld'
                }
              ]
            },
            {
              label: 'layout2',
              type: 'layout'
            }
          ]
        }
      },
      scopedSlots: {
        default: someProp => {
          const scoped = mount(PressBox, {
            context: { props: { ...someProp } }
          })
          return scoped.vnode
        }
      }
    })

    expect(wrapper.element).toMatchSnapshot()

    const layoutArray = wrapper.findAll('.flex')
    expect(layoutArray.length).toBe(1)
  })
})
