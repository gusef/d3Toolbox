#' Dendrogram based on D3
#'
#'
#'
#' @import htmlwidgets
#'
#' @export
d3Dendrogram <- function(dend, horiz = FALSE, label = TRUE, classic_tree = TRUE,
                         lab_adj = 120, callback_handler="DendSelection",
                         width = NULL, height = NULL, elementId = NULL) {

    if (class(dend) != 'dendrogram'){
        stop('Object dend needs to be a dendrogram')
    }

    tree <- getDendTree(dend)

    # forward options using x
    x = list(
        tree = tree,
        horiz = horiz,
        label = label,
        lab_adj = lab_adj,
        classic_tree = classic_tree,
        callback_handler = callback_handler
    )

  # create widget
  htmlwidgets::createWidget(
    name = 'd3Dendrogram',
    x,
    width = width,
    height = height,
    package = 'd3Toolbox',
    elementId = elementId,
    sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
  )
}

getDendTree <- function(dend){

    ret <- list(children = list(),
                label = '',
                height = 0,
                type = 'leaf')

    if (length(dend) == 1){
        ret$label <- attributes(dend)$label
    }else{
        ret$type <- 'branch'
        ret$height <- attributes(dend)$height
        ret$children[[1]] <- getDendTree(dend[[1]])
        ret$children[[2]] <- getDendTree(dend[[2]])
    }

    return (ret)
}



hcopt <- function(d, HC=NULL, method = "ward", members = NULL)
{
    if ( is.null(HC) ) {
        HC <- hclust(d,method=method,members=members)
    }
    ORD <- cba::order.optimal(d,merge=HC$merge)
    HC$merge <- ORD$merge
    HC$order <- ORD$order
    HC
}


#' Shiny bindings for d3Dendrogram
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
#' @name d3Scatter-shiny
#'
#' @export
d3DendrogramOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'd3Dendrogram', width, height, package = 'd3Toolbox')
}

#' @rdname d3Scatter-shiny
#' @export
renderd3Dendrogram <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, d3DendrogramOutput, env, quoted = TRUE)
}
