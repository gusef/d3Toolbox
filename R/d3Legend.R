#helper function 
formalize_legend <- function (colors, text, title){    
    #Fix the coloring
    colors <- gplots::col2hex(colors)
    if (length(colors) != length(text)){
        stop("Colors and text need to have the same length")
    }
    return (list(legend = data.frame(color = colors,
                                     text = text),
                 title = title))
}

#' d3Legend
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
d3Legend <- function(colors = NULL, text = NULL, title = NULL, leg_collect = NULL, 
                     fontsize = 12, square = 15, margins = NULL, width = NULL, 
                     height = NULL, elementId = NULL, collection = FALSE) {

    #there are two modes to this function - either a single legend or a collection
    if (is.null(margins)){
        margins <- list(top = 20,
                        left = 20)
    }

    #making a list of legends - even if there is only one
    legends <- list()
    if (!is.null(leg_collect)){
        for (i in 1:length(leg_collect)){
            legends[[i]] <- formalize_legend(leg_collect[[i]]$colors, 
                                             leg_collect[[i]]$text, 
                                             leg_collect[[i]]$title)
        }
    } else {
        legends[[1]] <- formalize_legend(colors, text, title)
    }
    
    # forward options using x
    x = list(
        type = "d3Legend",
        legends = legends,
        fontsize = fontsize,
        square = square,
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
