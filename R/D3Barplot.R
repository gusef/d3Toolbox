#' D3Barplot
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
d3Barplot <- function(data, col='black', tooltip='', unit='', xlab='', ylab='', padding=0.1,
                      title='', subtitle='', callback_handler='BarSelection', yrange=NULL,
                      margins = NULL, width = NULL, height = NULL, elementId = NULL) {

    if (is.null(margins)){
        margins <- list(top = 40,
                        right = 20,
                        bottom = 50,
                        left = 60)
    }

    if (!is.null(yrange) && length(yrange) != 2){
        stop("If yrange is specified it needs to have a length of 2")
    }

    #Fix the coloring
    col <- gplots::col2hex(col)

    #if we have only one variable
    if (is.null(dim(data))){
        data <- data.frame(x=data)
        #fix the coloring
        if(length(col)==1){
            col <- rep(col,nrow(data))
        }
    #stacked barplot
    }else{
        if(length(col)!=ncol(data)){
            stop('Need to specify one color for each variable')
        }
    }

    #separate names and data
    name <- rownames(data)
    rownames(data) <- NULL

    # forward options using x
    x = list(
        data = data,
        name = name,
        tooltip = tooltip,
        fill = col,
        unit = unit,
        xlab = xlab,
        ylab = ylab,
        yrange = yrange,
        padding = padding,
        title = title,
        max_value = max(rowSums(data)),
        subtitle = subtitle,
        margins=margins,
        callback_handler = callback_handler
    )

  # create widget
  htmlwidgets::createWidget(
    name = 'd3Barplot',
    x,
    width = width,
    height = height,
    package = 'd3Toolbox',
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
  )
}

#' Shiny bindings for D3Barplot
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
#' @name d3Barplot-shiny
#'
#' @export
d3BarplotOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Barplot', width, height, package = 'd3Toolbox')
}

#' @rdname d3Barplot-shiny
#' @export
renderd3Barplot <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3BarplotOutput, env, quoted = TRUE)
}
