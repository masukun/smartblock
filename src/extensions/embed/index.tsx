import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { setBlockType } from 'prosemirror-commands'
import { Fragment } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { Extension, ExtensionProps } from '../../types'
import { blockActive } from '../../utils'
import LinkIcon from '../../components/icons/link'
import Popup from './popup'
import Plugin from './plugin'

export default class Embed extends Extension {
  constructor(props?: ExtensionProps) {
    super(props)
  }

  get name() {
    return 'embed'
  }

  get group() {
    return 'block'
  }

  get showMenu() {
    return true
  }

  get hideInlineMenuOnFocus() {
    return true
  }

  get schema() {
    if (this.customSchema) {
      return this.customSchema
    }
    return {
      group: 'block',
      content: 'text*',
      selectable: true,
      isolating: true,
      attrs: {
        type: { default: 'youtube' },
        src: { default: '' }
      },
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs(dom) {
            return {
              src: dom.getAttribute('src')
            }
          }
        },
        {
          tag: 'div.embed-wrap',
          getAttrs(dom) {
            const a = dom.querySelector('a')
            return { src: a.getAttribute('href') }
          }
        }
      ],
      toDOM: node => {
        console.log(node.attrs.src)
        if (node.attrs.src.indexOf('youtube') !== -1) {
          const { src } = node.attrs
          let youtubeId = ''
          const matches = /www\.youtube\.com\/watch\?v=(.*?)$/.exec(src)
          if (matches && matches[1]) {
            youtubeId = matches[1]
          }
          if (!youtubeId) {
            const embedMatches = /www\.youtube\.com\/embed\/(.*?)$/.exec(src)
            if (embedMatches && embedMatches[1]) {
              youtubeId = embedMatches[1]
            }
          }
          if (youtubeId) {
            const url = `https://www.youtube.com/embed/${youtubeId}`
            return [
              'div',
              {
                contenteditable: true,
                class: 'youtube-frame-wrap'
              },
              [
                'div',
                {
                  class: 'youtube-frame'
                },
                [
                  'iframe',
                  {
                    src: url
                  }
                ]
              ]
            ]
          }
        } else if (node.attrs.src.indexOf('maps') !== -1) {
          class GoogleMap {
            embed: string;
            place: string;
            latitude: string;
            longitude: string;
            zoom: string;

            constructor(embed: string, place: string, latitude: string, longitude: string, zoom: string) {
              this.embed = embed;
              this.place = place;
              this.latitude = latitude;
              this.longitude = longitude;
              this.zoom = zoom;
            }

            getUrl() {
              let url: string = `https://www.google.com/maps/embed/v1/${this.embed}?q=${this.place}&center=${this.latitude},${this.longitude}&zoom=${this.zoom}&key=YourAPIKey`;
              return url;
            }
          }
          const FirstStringLatitude: number = node.attrs.src.indexOf('/@');
          const EndStringLatitude: number = node.attrs.src.indexOf(',', FirstStringLatitude + 2);
          const latitude: string = node.attrs.src.slice(FirstStringLatitude + 2, EndStringLatitude);
          //経度取得
          const EndStringLongitude: number = node.attrs.src.indexOf(',', EndStringLatitude + 1);
          const longitude: string = node.attrs.src.slice(EndStringLatitude + 1, EndStringLongitude);
          //ズーム値取得
          const EndStringZoom: number = node.attrs.src.indexOf('z', EndStringLongitude + 1);
          const zoom: string = node.attrs.src.slice(EndStringLongitude + 1, EndStringZoom + 1);
          //検索名取得
          const FirstStringPlaceName: number = node.attrs.src.lastIndexOf('/', FirstStringLatitude - 1);
          const placeName: string = node.attrs.src.slice(FirstStringPlaceName + 1, FirstStringLatitude);
          //embed取得
          const FirstStringEmbed: number = node.attrs.src.lastIndexOf('/', FirstStringPlaceName - 1);
          const embed: string = node.attrs.src.slice(FirstStringEmbed + 1, FirstStringPlaceName);
          //取得した情報を渡したクラスを追加
          const urlInfoArray: GoogleMap = new GoogleMap(embed, placeName, latitude, longitude, zoom);
          //理想のurlに書き換えるメソッドに渡す
          const necessaryUrl: string = urlInfoArray.getUrl();
          return [
            'div',
            {
              contenteditable: true,
              class: 'youtube-frame-wrap'
            },
            [
              'div',
              {
                class: 'youtube-frame'
              },
              [
                'iframe',
                {
                  src: necessaryUrl
                }
              ]
            ]
          ]
        }
        return [
          'div',
          {
            class: 'embed-wrap'
          },
          [
            'a',
            {
              class: 'embed',
              href: node.attrs.src
            },
            [
              'div',
              {
                class: 'embed-inner'
              },
              0
            ]
          ]
        ]
      }
    }
  }

  get icon() {
    return <LinkIcon style={{ width: '24px', height: '24px' }} />
  }

  active(state) {
    return blockActive(state.schema.nodes.embed)(state)
  }

  enable(state) {
    return setBlockType(state.schema.nodes.embed)(state)
  }

  onClick(state: EditorState, dispatch) {
    const div = document.createElement('div')
    document.body.appendChild(div)
    render(
      <Popup
        onClose={() => {
          unmountComponentAtNode(div)
        }}
        onDone={src => {
          const { pos } = state.selection.$anchor
          const text = state.schema.text(src)
          const node = state.schema.nodes.embed.createAndFill(
            {
              src
            },
            text
          )
          dispatch(state.tr.insert(pos, node))
          unmountComponentAtNode(div)
        }}
      />,
      div
    )
  }

  get plugins() {
    return [Plugin()]
  }
}