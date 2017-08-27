#' d3Legend
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
d3Legend <- function(colors, text, title = NULL, fontsize = 12, square = 15, 
                     margins = NULL, width = NULL, height = NULL, 
                     elementId = NULL, collection = FALSE) {

    if (is.null(margins)){
        margins <- list(top = 20,
                        left = 20)
    }
    
    #Fix the coloring
    colors <- gplots::col2hex(colors)

    if (length(colors) != length(text)){
        stop("Colors and text need to have the same length")
    }

    legend <- data.frame(color = colors,
                         text = text)
    
    # forward options using x
    x = list(
        type = "d3Legend",
        legend = legend,
        fontsize = fontsize,
        square = square,
        title = title,
        margins = margins
    )

    if (collection){
        return(x)
    }else{
        # create widget
        htmlwidgets::createWidget(
            name = 'd3Legend',
            x,
            width = width,
            height = height,
            package = 'd3Toolbox',
            elementId = elementId,
            sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
         )
    }
}

#' Shiny bindings for D3Legend
#'
#' Output and render functions for using D3Legend within Shiny
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
d3LegendOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Legend', width, height, package = 'd3Toolbox')
}

#' @rdname d3Legend-shiny
#' @export
renderd3Legend <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3LegendOutput, env, quoted = TRUE)
}
