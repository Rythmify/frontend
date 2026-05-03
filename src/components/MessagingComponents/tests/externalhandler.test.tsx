import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  handleExternalAbuse,
  handleExternalImpersonation,
  handleExternalTrademark,
  handleExternalOther,
} from '../externalhandler'

describe('externalhandler', () => {
  beforeEach(() => {
    vi.stubGlobal('open', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('handleExternalAbuse opens the abuse URL in a new tab', () => {
    handleExternalAbuse()
    expect(window.open).toHaveBeenCalledWith(
      'https://help.soundcloud.com/hc/en-us/articles/115003566048-Reporting-abuse-or-harassment',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('handleExternalImpersonation opens the impersonation URL in a new tab', () => {
    handleExternalImpersonation()
    expect(window.open).toHaveBeenCalledWith(
      'https://help.soundcloud.com/hc/en-us/articles/115003564108-Reporting-impersonation',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('handleExternalTrademark opens the trademark URL in a new tab', () => {
    handleExternalTrademark()
    expect(window.open).toHaveBeenCalledWith(
      'https://help.soundcloud.com/hc/en-us/articles/115003445387-Reporting-trademark-infringement',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('handleExternalOther opens the other reporting URL in a new tab', () => {
    handleExternalOther()
    expect(window.open).toHaveBeenCalledWith(
      'https://help.soundcloud.com/hc/en-us/articles/115003569668-Reporting-on-SoundCloud',
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('each handler opens a different URL', () => {
    handleExternalAbuse()
    handleExternalImpersonation()
    handleExternalTrademark()
    handleExternalOther()
    expect(window.open).toHaveBeenCalledTimes(4)
    const calls = (window.open as ReturnType<typeof vi.fn>).mock.calls
    const urls = calls.map((c: unknown[]) => c[0])
    const uniqueUrls = new Set(urls)
    expect(uniqueUrls.size).toBe(4)
  })

  it('all handlers use noopener,noreferrer', () => {
    handleExternalAbuse()
    handleExternalImpersonation()
    handleExternalTrademark()
    handleExternalOther()
    const calls = (window.open as ReturnType<typeof vi.fn>).mock.calls
    for (const call of calls) {
      expect(call[2]).toBe('noopener,noreferrer')
    }
  })

  it('all handlers use _blank target', () => {
    handleExternalAbuse()
    handleExternalImpersonation()
    handleExternalTrademark()
    handleExternalOther()
    const calls = (window.open as ReturnType<typeof vi.fn>).mock.calls
    for (const call of calls) {
      expect(call[1]).toBe('_blank')
    }
  })
})
