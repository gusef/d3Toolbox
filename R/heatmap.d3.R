#' Heatmap based on D3
#'
#'
#'
#' @import htmlwidgets
#'
#' @export
heatmap.d3 <- function(x,
                       Rowv = TRUE,
                       Colv = if (symm) "Rowv" else TRUE,
                       distfun = dist,
                       hclustfun = hclust,
                       dendrogram = c("both", "row", "column", "none"),
                       reorderfun = function(d, w) reorder(d, w),
                       scale = c("none", "row", "column"),
                       na.rm = TRUE,
                       revC = identical(Colv, "Rowv"),
                       col = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                       margins = c(100,20,20,80),
                       ColSideColors,
                       RowSideColors,
                       connectors,
                       fontsize = 12,
                       labRow = NULL,
                       labCol = NULL,
                       show_xlabs=T,
                       show_ylabs=T,
                       keysize = 1,
                       key = TRUE,
                       key.title = 'Color Key',
                       key.subtitle = 'and Histogram',
                       key.xlab = 'Row z-score',
                       key.ylab = 'Count',
                       legend = NULL,
                       legend.colors = NULL, 
                       legend.text = NULL, 
                       legend.title = NULL,
                       legend.width = 1,
                       symm = FALSE,
                       main = NULL,
                       xlab = NULL,
                       ylab = NULL,
                       lhei = NULL,
                       lwid = NULL,
                       callback = 'heatmap_callback'){

    scale01 <- function(x, low = min(x), high = max(x)) {
        x <- (x - low)/(high - low)
        x
    }

    #scale
    scale <- if (missing(scale))
        "none"
    else match.arg(scale)

    dendrogram <- match.arg(dendrogram)

    if (length(col) == 1 && is.character(col))
        col <- get(col, mode = "function")

    if (is.null(Rowv) || is.na(Rowv))
        Rowv <- FALSE

    if (is.null(Colv) || is.na(Colv))
        Colv <- FALSE

    else if (all(Colv == "Rowv"))
        Colv <- Rowv

    if (length(di <- dim(x)) != 2 || !is.numeric(x))
        stop("`x' must be a numeric matrix")

    nr <- di[1]
    nc <- di[2]

    if (nr <= 1 || nc <= 1)
        stop("`x' must have at least 2 rows and 2 columns")

    if (!is.numeric(margins) || length(margins) != 4)
        stop("`margins' must be a numeric vector of length 4 (bottom,left,top,right")


    ###########################################################################
    #Dealing with dendrograms
    if (!inherits(Rowv, "dendrogram")) {
        if (((is.logical(Rowv) && !isTRUE(Rowv)) || (is.null(Rowv))) &&
            (dendrogram %in% c("both", "row"))) {
            warning("Discrepancy: Rowv is FALSE, while dendrogram is `",
                    dendrogram, "'. Omitting row dendogram.")
            if (dendrogram == "both")
                dendrogram <- "column"
            else dendrogram <- "none"
        }
    }

    if (!inherits(Colv, "dendrogram")) {
        if (((is.logical(Colv) && !isTRUE(Colv)) || (is.null(Colv))) &&
            (dendrogram %in% c("both", "column"))) {
            warning("Discrepancy: Colv is FALSE, while dendrogram is `",
                    dendrogram, "'. Omitting column dendogram.")
            if (dendrogram == "both")
                dendrogram <- "row"
            else dendrogram <- "none"
        }
    }

    if (inherits(Rowv, "dendrogram")) {
        ddr <- Rowv
        rowInd <- order.dendrogram(ddr)
        if (length(rowInd) > nr || any(rowInd < 1 | rowInd > nr))
            stop("Rowv dendrogram doesn't match size of x")
        if (length(rowInd) < nr)
            nr <- length(rowInd)
    }

    else if (is.integer(Rowv)) {
        distr <- distfun(x)
        hcr <- hclustfun(distr)
        ddr <- as.dendrogram(hcr)
        ddr <- reorderfun(ddr, Rowv)
        rowInd <- order.dendrogram(ddr)
        if (nr != length(rowInd))
            stop("row dendrogram ordering gave index of wrong length")
    }

    else if (isTRUE(Rowv)) {
        Rowv <- rowMeans(x, na.rm = na.rm)
        distr <- distfun(x)
        hcr <- hclustfun(distr)
        ddr <- as.dendrogram(hcr)
        ddr <- reorderfun(ddr, Rowv)
        rowInd <- order.dendrogram(ddr)
        if (nr != length(rowInd))
            stop("row dendrogram ordering gave index of wrong length")
    }

    else if (!isTRUE(Rowv)) {
        rowInd <- nr:1
        ddr <- as.dendrogram(hclust(dist(diag(nr))))
    }

    else {
        rowInd <- nr:1
        ddr <- as.dendrogram(Rowv)
    }

    if (inherits(Colv, "dendrogram")) {
        ddc <- Colv
        colInd <- order.dendrogram(ddc)
        if (length(colInd) > nc || any(colInd < 1 | colInd > nc))
            stop("Colv dendrogram doesn't match size of x")
        if (length(colInd) < nc)
            nc <- length(colInd)
    }
    else if (identical(Colv, "Rowv")) {
        if (nr != nc)
            stop("Colv = \"Rowv\" but nrow(x) != ncol(x)")
        if (exists("ddr")) {
            ddc <- ddr
            colInd <- order.dendrogram(ddc)
        }
        else colInd <- rowInd
    }
    else if (is.integer(Colv)) {
        distc <- distfun(if (symm)
            x
            else t(x))
        hcc <- hclustfun(distc)
        ddc <- as.dendrogram(hcc)
        ddc <- reorderfun(ddc, Colv)
        colInd <- order.dendrogram(ddc)
        if (nc != length(colInd))
            stop("column dendrogram ordering gave index of wrong length")
    }
    else if (isTRUE(Colv)) {
        Colv <- colMeans(x, na.rm = na.rm)
        distc <- distfun(if (symm)
            x
            else t(x))
        hcc <- hclustfun(distc)
        ddc <- as.dendrogram(hcc)
        ddc <- reorderfun(ddc, Colv)
        colInd <- order.dendrogram(ddc)
        if (nc != length(colInd))
            stop("column dendrogram ordering gave index of wrong length")
    }
    else if (!isTRUE(Colv)) {
        colInd <- 1:nc
        ddc <- as.dendrogram(hclust(dist(diag(nc))))
    }
    else {
        colInd <- 1:nc
        ddc <- as.dendrogram(Colv)
    }

    #reordering of the matrix
    x <- x[rowInd, colInd]
    x.unscaled <- x


    #row labels
    if (is.null(labRow))
        labRow <- if (is.null(rownames(x)))
            (1:nr)[rowInd]
    else rownames(x)
    else labRow <- labRow[rowInd]

    #column labels
    if (is.null(labCol))
        labCol <- if (is.null(colnames(x)))
            (1:nc)[colInd]
    else colnames(x)
    else labCol <- labCol[colInd]


    #dealing with scaling
    if (scale == "row") {
        rm <- rowMeans(x, na.rm = na.rm)
        x <- sweep(x, 1, rm)
        sx <- apply(x, 1, sd, na.rm = na.rm)
        x <- sweep(x, 1, sx, "/")
    }else if (scale == "column") {
        rm <- colMeans(x, na.rm = na.rm)
        x <- sweep(x, 2, rm)
        sx <- apply(x, 2, sd, na.rm = na.rm)
        x <- sweep(x, 2, sx, "/")
    }

    #figuring out the color scheme
    if (is.function(col)){
        col <- col(16)
    }

    #row color bar
    if (!missing(RowSideColors)){
        if (!is.character(RowSideColors))
            stop("'RowSideColors' must be a character matrix / vector")
        if (is.null(dim(RowSideColors))){
            if (length(RowSideColors) != nr)
                stop('if RowSideColors is a vector it needs to have the same length as the rows in the matrix')
            RowSideColors <- as.matrix(RowSideColors[rowInd])
        }else{
            if (nrow(RowSideColors) != nr)
                stop('if RowSideColors is a matrix it needs to have the same number of rows as the matrix')
            RowSideColors <- RowSideColors[rowInd,]
        }
    }

    #column color bar
    if (!missing(ColSideColors)) {
        if (!is.character(ColSideColors))
            stop("'ColSideColors' must be a character matrix / vector")
        if (is.null(dim(ColSideColors))){
            if (length(ColSideColors) != nc)
                stop('if ColSideColors is a vector it needs to have the same length as the rows in the matrix')
            ColSideColors <- t(as.matrix(ColSideColors[colInd]))
        }else{
            if (ncol(ColSideColors) != nc)
                stop('if ColSideColors is a matrix it needs to have the same number of rows as the matrix')
            ColSideColors <- ColSideColors[,colInd]
        }
    }

    if (missing(connectors)){
        connectors <- list()
        connectors[[1]] <- data.frame(names=c(1,3),
                                      dims=c('column','value'))
        connectors[[2]] <- data.frame(names=c(1,2),
                                      dims=c('row','value'))
    }

    increment <- function(connector){
        connector$names <- connector$names + 1
        return(connector)
    }
    #setting up the layout matrix
    if (missing(lhei) || is.null(lhei))
        lhei <- c(keysize, 4)
    if (missing(lwid) || is.null(lwid))
        lwid <- c(keysize, 4)

    lmat <- rbind(4:3, 2:1)

    #if there are no dendrograms set the subplot to 0
    if (!dendrogram %in% c("both", "row")){
        lmat[2,1] <- NA
    }

    if (!dendrogram %in% c("both", "column")){
        lmat[1,2] <- NA
    }


    #add top color bar
    if (!missing(ColSideColors)) {
        lmat <- rbind(lmat[1, ] + 1, c(NA, 1), lmat[2, ] + 1)
        lhei <- c(lhei[1], 0.2, lhei[2])

        if (length(connectors) > 0){
            connectors <- lapply(connectors,increment)
            idx <- (1:length(connectors))[sapply(connectors,function(x)'column' %in% x$dim)]
            if (length(connectors) > 0){
                connectors[[idx]] <- data.frame(names = c(connectors[[idx]]$names,1),
                                                dims = c(as.character(connectors[[idx]]$dims),'column'))
            }
        }
    }

    #add side color bar
    if (!missing(RowSideColors)) {
        lmat <- cbind(lmat[, 1] + 1, c(rep(NA, nrow(lmat) - 1), 1), lmat[, 2] + 1)
        lwid <- c(lwid[1], 0.2, lwid[2])

        if (length(connectors) > 0){
            connectors <- lapply(connectors,increment)
            idx <- (1:length(connectors))[sapply(connectors,function(x)'row' %in% x$dim)]
            if (length(connectors) > 0){
                connectors[[idx]] <- data.frame(names = c(connectors[[idx]]$names,1),
                                                dims = c(as.character(connectors[[idx]]$dims),'row'))
            }
        }
    }
    
    if (length(lhei) != nrow(lmat))
        stop("lhei must have length = nrow(lmat) = ", nrow(lmat))
    if (length(lwid) != ncol(lmat))
        stop("lwid must have length = ncol(lmat) =", ncol(lmat))

    #putting together the collection element
    data <- list()
    idx <- 1

    #side color bar
    if (!missing(RowSideColors)) {
        data[[idx]] <- list(type = 'd3Image',
                            data = RowSideColors,
                            raw_values=NULL,
                            show_xlabs = F,
                            allow_NA = T,
                            margins=list(top = 0,
                                         right = 5,
                                         bottom = margins[1],
                                         left = 5))
        idx <- idx +1
    }

    #top color bar
    if (!missing(ColSideColors)) {
        data[[idx]] <- list(type = 'd3Image',
                            data = ColSideColors,
                            raw_values=NULL,
                            show_xlabs = F,
                            allow_NA = T,
                            margins=list(top = 0,
                                         right = margins[4],
                                         bottom = 5,
                                         left = 0))
        idx <- idx +1
    }

    #add labels
    colnames(x) <- labCol
    rownames(x) <- labRow

    #expression matrix
    data[[idx]] <- list(type = 'd3Image',
                        data = x,
                        raw_values = x.unscaled,
                        xlab = labCol,
                        ylab = labRow,
                        xlab_text = xlab,
                        ylab_text = ylab,
                        lab_font_size = fontsize,
                        col_scale = col,
                        margins=list(top = 0,
                                     right = margins[4],
                                     bottom = margins[1],
                                     left = 0))
    idx <- idx +1

    #side dendrogram
    if (dendrogram %in% c("both", "row")) {
        data[[idx]] <- list(type = 'd3Dendrogram',
                            data = ddr,
                            label = F,
                            axis = F,
                            horiz = T,
                            margins=list(top = 0,
                                         right = 5,
                                         bottom = margins[1],
                                         left = 10))
        idx <- idx + 1
    }

    #top dendrogram
    if (dendrogram %in% c("both", "column")) {
        data[[idx]] <- list(type = 'd3Dendrogram',
                          data = ddc,
                          label = F,
                          axis = F,
                          margins=list(top = 10,
                                       right = margins[4],
                                       bottom = 5,
                                       left = 0))
        idx <- idx + 1
    }

    #key
    if (key) {
        data[[idx]] <- list(type = 'd3Colorkey',
                          data = x,
                          colscale=col,
                          xlab = key.xlab,
                          ylab = key.ylab,
                          title = key.title,
                          subtitle = key.subtitle)

        idx <- idx + 1
    }else{
        lmat[1,1] <- NA
    }

    if (!is.null(legend) || !is.null(legend.colors) && !is.null(legend.text)){
        #add to the layout
        lmat <- cbind(lmat, 1 + max(lmat, na.rm = T))
        lwid <- c(lwid, legend.width)
        
        #generate legend object
        leg <- list(type = 'd3Legend')
        
        if (!is.null(legend)){
            leg$leg_collect = legend
        } else{
            leg$colors = legend$colors
            leg$text = legend$text
            leg$title = legend$title
        }
        
        data[[idx]] <- leg
        idx <- idx + 1
    }
    
    d3Collection(data,
                 lmat = lmat,
                 lwid = lwid,
                 lhei = lhei,
                 connectors = connectors,
                 title = main,
                 callback = callback)

}
