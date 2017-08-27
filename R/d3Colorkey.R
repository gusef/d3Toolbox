#' d3Colorkey
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
d3Colorkey <- function(data,
                       colscale=RColorBrewer::brewer.pal(11,"RdBu")[11:1], 
                       xlab='Row z-score', ylab='Count', 
                       title='Color Key', subtitle='and Histogram',
                       keysize = NULL, width = NULL, height = NULL,
                       elementId = NULL, collection = FALSE) {

    if (is.null(keysize)){
        keysize <- list(height = 80,
                        width = 120)
    }

    #Fix the coloring
    colscale <- gplots::col2hex(colscale)
    
    breaks <- seq(min(data, na.rm = T),
                  max(data, na.rm = T),
                  length = length(colscale) + 1 )
    h <- hist(data, plot = FALSE, breaks = breaks)
    
    
    # forward options using x
    x = list(
        type = "d3Colorkey",
        colscale = colscale,
        hist = h,
        keysize = keysize,
        xlab = xlab,
        ylab = ylab,
        title = title,
        subtitle = subtitle
    )

    if (collection){
        return(x)
    }else{
        # create widget
        htmlwidgets::createWidget(
            name = 'd3Colorkey',
            x,
            width = width,
            height = height,
            package = 'd3Toolbox',
            elementId = elementId,
            sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
         )
    }
}

#' Shiny bindings for D3Colorkey
#'
#' Output and render functions for using D3Barplot within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3Barplot
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3Colorkey-shiny
#'
#' @export
d3ColorkeyOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Colorkey', width, height, package = 'd3Toolbox')
}

#' @rdname d3Colorkey-shiny
#' @export
renderd3Colorkey <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3ColorkeyOutput, env, quoted = TRUE)
}
