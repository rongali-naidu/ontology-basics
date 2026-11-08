import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { StreamLanguage, HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { turtle } from '@codemirror/legacy-modes/mode/turtle'
import { sparql } from '@codemirror/legacy-modes/mode/sparql'

const highlight = HighlightStyle.define([
  { tag: [t.keyword, t.operatorKeyword], color: 'var(--tok-keyword)', fontWeight: '600' },
  { tag: [t.atom, t.bool, t.number], color: 'var(--tok-atom)' },
  { tag: [t.string, t.special(t.string)], color: 'var(--tok-string)' },
  { tag: [t.comment, t.lineComment], color: 'var(--tok-comment)', fontStyle: 'italic' },
  { tag: [t.variableName, t.definition(t.variableName)], color: 'var(--tok-var)' },
  { tag: [t.meta, t.typeName, t.tagName, t.url], color: 'var(--tok-iri)' },
  { tag: [t.operator, t.punctuation, t.bracket], color: 'var(--muted)' }
])

const theme = EditorView.theme({
  '&': { height: '100%', fontSize: '13px', backgroundColor: 'var(--editor-bg)', color: 'var(--text)' },
  '.cm-scroller': { fontFamily: 'var(--mono)', lineHeight: '1.55' },
  '.cm-gutters': { backgroundColor: 'var(--editor-bg)', color: 'var(--faint)', border: 'none' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--active-line)' },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--text)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: 'var(--selection) !important' },
  '.cm-matchingBracket': { backgroundColor: 'var(--selection)', outline: 'none' }
})

export function createEditor (parent, lang, { onRun, onChange } = {}) {
  const language = StreamLanguage.define(lang === 'sparql' ? sparql : turtle)
  const runKeys = keymap.of([{ key: 'Mod-Enter', run: () => { onRun?.(); return true } }])
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: '',
      extensions: [
        runKeys,
        basicSetup,
        language,
        syntaxHighlighting(highlight),
        theme,
        EditorView.lineWrapping,
        EditorView.updateListener.of(u => { if (u.docChanged) onChange?.() })
      ]
    })
  })
  return {
    view,
    get value () { return view.state.doc.toString() },
    set value (v) { view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: v } }) }
  }
}

export { Compartment }
