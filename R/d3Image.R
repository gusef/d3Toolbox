#' Heatmap image based on d3
#'
#'
#'
#' @import htmlwidgets
#'
#' @export
d3Image <- function(mat, xlab = '', ylab = '', raw_values = NULL,
                    show_xlabs = !is.null(colnames(mat)),
                    show_ylabs = !is.null(rownames(mat)),
                    allow_NA = FALSE,
                    title=NULL, subtitle=NULL, callback_handler='ImageSelection',
                    width = NULL, height = NULL, margins = NULL,
                    col_scale = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                    elementId = NULL) {

    if (is.null(margins)){
        margins <- list(top = 40,
                        right = 20,
                        bottom = 50,
                        left = 60)
    }

    if (!is.null(raw_values)){
        if (!all(dim(raw_values) == dim(mat))){
            stop("The raw_values matrix needs to have the same dimensions as the matrix")
        }
    }else{
        raw_values <- mat
    }

    if (!allow_NA && sum(is.na(mat)) >0){
        stop('NA values detected, please set allow_NA=TRUE')
    }

    #coloring
    col_scale <- gplots::col2hex(col_scale)


    breaks <- seq(min(mat, na.rm = T),
                  max(mat, na.rm = T),
                  length = length(col_scale) + 1 )

    grps <- cut(mat, breaks = breaks, include.lowest = TRUE)
    col <- col_scale[grps]
    col <- matrix(col, ncol=ncol(mat))


    # forward options using x
    x = list(
        data = col,
        raw_values = raw_values,
        xlab = xlab,
        ylab = ylab,
        xax = colnames(mat),
        yax = rownames(mat),
        show_xax = show_xlabs,
        show_yax = show_ylabs,
        title = title,
        subtitle = subtitle,
        margins=margins,
        callback_handler = callback_handler
    )

    # create widget
    htmlwidgets::createWidget(
        name = 'd3Image',
        x,
        width = width,
        height = height,
        package = 'd3Toolbox',
        elementId = elementId,
        sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
    )
}

#' Shiny bindings for d3Image
#'
#' Output and render functions for using D3Scatter within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a D3Scatter
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3Image-shiny
#'
#' @export
d3ImageOutput <- function(outputId, width = '100%', height = '400px'){
    htmlwidgets::shinyWidgetOutput(outputId, 'd3Image', width, height, package = 'd3Toolbox')
}

#' @rdname d3Image-shiny
#' @export
renderd3Image <- function(expr, env = parent.frame(), quoted = FALSE) {
    if (!quoted) { expr <- substitute(expr) } # force quoted
    htmlwidgets::shinyRenderWidget(expr, d3ImageOutput, env, quoted = TRUE)
}
