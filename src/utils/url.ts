export function getDomainName(url: string): string {
  if (!url) return ''

  try {
    // Ensure the URL has a protocol so the URL constructor can parse it
    const normalizedUrl = url.includes('://') ? url : `http://${url}`
    const { hostname } = new URL(normalizedUrl)

    const parts = hostname.split('.')

    // If it's an IP address or localhost
    if (parts.length <= 1 || /^\d+(\.\d+){3}$/.test(hostname)) {
      return hostname
    }

    // Common second-level domain suffix handling (simple implementation)
    const isSecondLevelTld =
      parts.length > 2 && ['com', 'org', 'net', 'edu', 'gov'].includes(parts[parts.length - 2]!)
    const tldCount = isSecondLevelTld ? 2 : 1

    // Remove TLD
    const remainingParts = parts.slice(0, parts.length - tldCount)

    // If there's more than one part left, remove common subdomains like www, api, etc.
    if (remainingParts.length > 1) {
      const subdomains = ['www', 'api', 'app', 'v1', 'v2']
      if (subdomains.includes(remainingParts[0]!.toLowerCase())) {
        return remainingParts[1]!
      }
      // Return the main domain part (usually the last part)
      return remainingParts[remainingParts.length - 1]!
    }

    return remainingParts[0] || hostname
  } catch (e) {
    console.log('Error parsing URL:', e)
    return ''
  }
}
