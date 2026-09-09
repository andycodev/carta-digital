declare module 'html2pdf.js' {
  export interface Html2PdfOptions {
    margin?: number | [number, number, number, number]
    filename?: string
    image?: { type?: 'jpeg' | 'png' | 'webp' | string; quality?: number }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      logging?: boolean
      backgroundColor?: string | null
      [key: string]: any
    }
    jsPDF?: {
      unit?: string
      format?: string | [number, number]
      orientation?: 'portrait' | 'landscape'
      [key: string]: any
    }
    pagebreak?: { mode?: string | string[]; before?: string; after?: string; avoid?: string }
  }

  export interface Html2PdfInstance {
    set(options: Html2PdfOptions): Html2PdfInstance
    from(element: HTMLElement | string): Html2PdfInstance
    save(): Promise<void>
    outputPdf(type?: string): Promise<any>
    toPdf(): Html2PdfInstance
  }

  function html2pdf(): Html2PdfInstance
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Promise<void>

  export default html2pdf
}
