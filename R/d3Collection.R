#' Plot collection based on d3
#'
#'
#'
#' @import htmlwidgets
#'
#' @export
d3Collection <- function(data,
                         lmat,
                         lwid = rep.int(1, ncol(lmat)),
                         lhei = rep.int(1, nrow(lmat)),
                         title = NULL,
                         connectors = NULL,
                         callback = 'collection_callback',
                         width = NULL, height = NULL, margins = NULL,
                         elementId = NULL) {

    if (is.null(margins)){
        margins <- list(top = 10,
                        right = 40,
                        bottom = 60,
                        left = 10)
    }

    if (class(data) != 'list'){
        stop('data needs to be a list with all data for each plot')
    }

    if (max(lmat, na.rm = T) != length(data)){
        stop('Each element in lmat needs to correspond to one data element')
    }

    if (!all(1:max(lmat, na.rm = T) %in% lmat)){
        stop('The elements in lmat need to be declared from 1 to number of elements')
    }

    #check the layout
    if (class(lwid) != 'numeric' || length(lwid) != ncol(lmat)){
        stop('lwid needs to be a numeric vector with length == ncol(lmat)')
    }

    if (class(lhei) != 'numeric' || length(lhei) != nrow(lmat)){
        stop('lwid needs to be a numeric vector with length == nrow(lmat)')
    }

    if (!is.null(connectors)){
        if (!all(sapply(connectors,dim)[,2]==2)){
            stop('Connectors must be a list where each element has 2 columns.',
                 ':"names" corresponding to the layout and ',
                 '"dims" corresponding to the dimension in the chosen d3Plot')
        }
        if (!all(sapply(connectors,function(x,lmat)all(x[,1] %in% lmat),lmat))){
            stop('Connectors must be a list where each element has 2 columns.',
                 'The first row, "names" must be correspond to the layout index',
                 'and no idizes not included in lmat are allowed.')
        }
        for (i in 1:length(connectors)){
            names(connectors[[i]]) <- c('names','dims')
        }
    }


    #normalize
    lwid <- lwid / sum(lwid)
    lhei <- lhei / sum(lhei)

    #getting all the default parameters
    getDefaults <- function(dat){
        params <- dat[!names(dat) %in% 'type']
        params$collection <- T
        ret <- do.call(match.fun(dat$type),params)
        return(ret)
    }
    data <- lapply(data,getDefaults)

    # forward options using x
    x = list(
        data = data,
        lmat = lmat,
        lwid = lwid,
        lhei = lhei,
        title = title,
        connectors = connectors,
        callback = callback,
        margins = margins
    )

    # create widget
    htmlwidgets::createWidget(
        name = 'd3Collection',
        x,
        width = width,
        height = height,
        package = 'd3Toolbox',
        elementId = elementId,
        sizingPolicy = htmlwidgets::sizingPolicy(browser.fill = TRUE)
    )
}

#' Shiny bindings for d3Collection
#'
#' Output and render functions for using d3Collection within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a d3Collection
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name d3Scatter-shiny
#'
#' @export
d3CollectionOutput <- function(outputId, width = '100%', height = '400px'){
    htmlwidgets::shinyWidgetOutput(outputId, 'd3Collection', width, height, package = 'd3Toolbox')
}

#' @rdname d3Scatter-shiny
#' @export
renderd3Collection <- function(expr, env = parent.frame(), quoted = FALSE) {
    if (!quoted) { expr <- substitute(expr) } # force quoted
    htmlwidgets::shinyRenderWidget(expr, d3CollectionOutput, env, quoted = TRUE)
}
