import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { err: null }
  }

  static getDerivedStateFromError(err) {
    return { err }
  }

  render() {
    if (this.state.err) {
      const msg = String(this.state.err?.message || this.state.err)
      return (
        <div
          style={{
            boxSizing: 'border-box',
            minHeight: '100dvh',
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            background: '#f8fafc',
            color: '#0f172a',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', margin: '0 0 12px' }}>
            화면을 그리다가 오류가 났습니다
          </h1>
          <p style={{ margin: '0 0 16px', lineHeight: 1.5, color: '#475569' }}>
            새로고침(F5)하거나 다른 브라우저에서 열어 보세요. 증상이 계속되면 개발자 도구(F12)
            → Console에 표시된 빨간 메시지를 확인하세요.
          </p>
          <pre
            style={{
              margin: 0,
              padding: 12,
              fontSize: 12,
              overflow: 'auto',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              maxHeight: '40vh',
            }}
          >
            {msg}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  document.body.innerHTML =
    '<p style="font-family:system-ui;padding:16px">#root 요소가 없습니다.</p>'
} else {
  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>
  )
}
