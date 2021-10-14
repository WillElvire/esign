import { WebViewerInstance } from '@pdftron/webviewer'

export const applyFields = (instance: WebViewerInstance, callback: CallableFunction) => {
  return async () => {
    if (typeof instance === undefined || instance == null) {
      return
    }

    const { annotationManager, Annotations } = instance.Core
    const fieldManager = annotationManager.getFieldManager()
    const annotationsList = annotationManager.getAnnotationsList()
    const annotationsToDelete: any[] = []
    const annotationsToDraw: any[] = []

    await Promise.all(
      annotationsList.map(async (annotation, index) => {
        let inputAnnotation
        let field

        if (typeof annotation.custom !== 'undefined') {
          // create a form field based on the type of annotation
          if (annotation.custom.type === 'TEXT') {
            const flags = new Annotations.WidgetFlags(['Required'])

            field = new Annotations.Forms.Field(annotation.getContents() + Date.now() + index, {
              type: 'Tx',
              value: annotation.custom.value,
              flags
            })

            inputAnnotation = new Annotations.TextWidgetAnnotation(field, null)
          } else if (annotation.custom.type === 'SIGNATURE') {
            const flags = new Annotations.WidgetFlags(['Required'])

            field = new Annotations.Forms.Field(annotation.getContents() + Date.now() + index, {
              type: 'Sig',
              flags
            })

            inputAnnotation = new Annotations.SignatureWidgetAnnotation(field, {
              appearance: '_DEFAULT',
              appearances: {
                _DEFAULT: {
                  Normal: {
                    data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC',
                    offset: {
                      x: 100,
                      y: 100,
                    },
                  },
                },
              },
            })
          } else if (annotation.custom.type === 'DATE') {
            field = new Annotations.Forms.Field(annotation.getContents() + Date.now() + index, {
              type: 'Tx',
              value: 'd-m-yyyy',
              // Actions need to be added for DatePickerWidgetAnnotation to recognize this field.
              actions: {
                F: [
                  {
                    name: 'JavaScript',
                    // You can customize the date format here between the two double-quotation marks
                    // or leave this blank to use the default format
                    javascript: 'AFDate_FormatEx("d mmm, yyyy");',
                  },
                ],
                K: [
                  {
                    name: 'JavaScript',
                    // You can customize the date format here between the two double-quotation marks
                    // or leave this blank to use the default format
                    javascript: 'AFDate_FormatEx("d mmm, yyyy");',
                  },
                ],
              },
            })

            inputAnnotation = new Annotations.DatePickerWidgetAnnotation(field, null)
          } else {
            // exit early for other annotations
            annotationManager.deleteAnnotation(annotation) // prevent duplicates when importing xfdf
            return
          }
        } else {
          // exit early for other annotations
          return
        }

        // set position
        inputAnnotation.PageNumber = annotation.getPageNumber()
        inputAnnotation.X = annotation.getX()
        inputAnnotation.Y = annotation.getY()
        inputAnnotation.rotation = annotation.Rotation

        if (annotation.Rotation === 0 || annotation.Rotation === 180) {
          inputAnnotation.Width = annotation.getWidth()
          inputAnnotation.Height = annotation.getHeight()
        } else {
          inputAnnotation.Width = annotation.getHeight()
          inputAnnotation.Height = annotation.getWidth()
        }

        // delete original annotation
        annotationsToDelete.push(annotation)

        // customize styles of the form field
        Annotations.WidgetAnnotation.getCustomStyles = function (widget) {
          if (widget instanceof Annotations.SignatureWidgetAnnotation) {
            return { border: '1px solid #a5c7ff', }
          }
        }

        Annotations.WidgetAnnotation.getCustomStyles(inputAnnotation)

        // draw the annotation the viewer
        annotationManager.addAnnotation(inputAnnotation, { imported: true})
        fieldManager.addField(field)
        annotationsToDraw.push(inputAnnotation)
      })
    )

    // delete old annotations
    annotationManager.deleteAnnotations(annotationsToDelete)

    // refresh viewer
    await annotationManager.drawAnnotationsFromList(annotationsToDraw)

	const xfdfString = await annotationManager.exportAnnotations({ widgets: true, fields: true })

    await callback(xfdfString)
  }
}

export const addField = (instance: WebViewerInstance) => {
  return (type: string, name: string = '', value: string = '', flag = {}, point = { x: null }) => {
    if (typeof instance === undefined || instance == null) {
      return
    }

    const { documentViewer, Annotations, annotationManager, Math } = instance.Core

    const document = documentViewer.getDocument()
    const displayMode = documentViewer.getDisplayModeManager().getDisplayMode()
    const page = displayMode.getSelectedPages(point, point)

    if (!!point.x && page.first == null) {
      return // don't add field to an invalid page location
    }

    const pageIdx = page.first !== null ? page.first : documentViewer.getCurrentPage()
    const pageInfo = document.getPageInfo(pageIdx)
    const pagePoint = displayMode.windowToPage(point, pageIdx)
    const zoom = documentViewer.getZoom()
    const rotation = documentViewer.getCompleteRotation(pageIdx) * 90

    const textAnnotation = new Annotations.FreeTextAnnotation()
    textAnnotation.PageNumber = pageIdx
    textAnnotation.Rotation = rotation

    if (rotation === 270 || rotation === 90) {
      textAnnotation.Width = 50.0 / zoom
      textAnnotation.Height = 250.0 / zoom
    } else {
      textAnnotation.Width = 250.0 / zoom
      textAnnotation.Height = 50.0 / zoom
    }

    textAnnotation.X = (pagePoint.x || pageInfo.width / 2) - textAnnotation.Width / 2
    textAnnotation.Y = (pagePoint.y || pageInfo.height / 2) - textAnnotation.Height / 2

    // Use a custom attribute for ease of use
    textAnnotation.custom = {
      type,
      value,
      flag,
      name: `${name.replace('.', '_')}_${type}_`,
    }

    // set the type of annotation
    textAnnotation.FontSize = (20.0 / zoom) + 'px'
    textAnnotation.StrokeThickness = 1
    textAnnotation.TextAlign = 'center'
    textAnnotation.FillColor = new Annotations.Color(211, 211, 211, 0.5)
    textAnnotation.TextColor = new Annotations.Color(0, 165, 228)
    textAnnotation.StrokeColor = new Annotations.Color(0, 165, 228)
    textAnnotation.Author = annotationManager.getCurrentUser()

    textAnnotation.setContents(textAnnotation.custom.name)
    textAnnotation.setPadding(new Math.Rect(0, 0, 0, 0))

    annotationManager.deselectAllAnnotations()
    annotationManager.addAnnotation(textAnnotation, { autoFocus: true })
    annotationManager.redrawAnnotation(textAnnotation)
  }
}
