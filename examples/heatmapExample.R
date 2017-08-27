require(Biobase)
require(RColorBrewer)
require(d3Toolbox)

ui <- fillPage(
    fillCol(
        fillRow(
            d3BarplotOutput("key", width = "100%", height = "100%"),
            d3DendrogramOutput("top_dendrogram", width = "100%", height = "100%"),
            flex = c(3,10)),
        fillRow(
            d3ImageOutput("empty", width = "100%", height = "100%"),
            d3ImageOutput("colColbar", width = "100%", height = "100%"),
            flex = c(3,10)
        ),
        fillRow(
            d3DendrogramOutput("left_dendrogram", width = "100%", height = "100%"),
            d3ImageOutput("ExpressionMatrix", width = "100%", height = "100%"),
            flex = c(3,10)
        ),
        flex = c(3,1,10))
)

server <- function(input, output, session) {

    #dir <- '/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/'
    dir <- '/Users/gusef/Dropbox (Personal)/Hephaestus/data/'
    
    eSet <- readRDS(paste0(dir,'RNAseq_nodedup_cpm.RDS'))
    eSet <- eSet[,eSet$Visit.Code == "SCREEN"]

    #fix genes
    genes <- as.character(read.csv(paste0(dir,'genes.txt'))[,1])
    eSet <- eSet[rowSums(exprs(eSet)) >0, ]
    exprs(eSet) <- log2(exprs(eSet) + 1)
    eSet <- eSet[fData(eSet)$hgnc_symbol %in% genes,]
    rownames(eSet) <- fData(eSet)$hgnc_symbol

    #fix labels
    eSet$BORI[eSet$BORI=='NE'] <- NA
    eSet$BORI <- droplevels(eSet$BORI)
    colnames(eSet) <- eSet$SUBJID

    #top dendrogram
    hc01.col <- hcopt(dist(t(exprs(eSet))),method="ward.D")
    top_dend <- as.dendrogram(hc01.col)
    colInd <- order.dendrogram(top_dend)

    #left dendrogram
    hc01.row <- hcopt(as.dist(1-cor(t(exprs(eSet)))),method="ward.D")
    left_dend <- as.dendrogram(hc01.row)
    rowInd <- order.dendrogram(left_dend)

    right_mar <- 100
    bottom_mar <- 100
    left_mar <- 10

    output$key <- renderd3Barplot({
        d3Barplot(data=rep(1,11),
                  show_axes = F,
                  padding = 0,
                  col=RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                  margins=list(top = 40,
                               right = 40,
                               bottom = 40,
                               left = 40))
    })

    output$top_dendrogram <- renderd3Dendrogram({
        d3Dendrogram(top_dend,
                     label = F,
                     axis = F,
                     title = "First prototype of a heatmap",
                     margins=list(top = 40,
                                  right = right_mar,
                                  bottom = 5,
                                  left = 0)
        )
    })

    output$colColbar <- renderd3Image({
        topbar <- rbind(c('#2ca25f','#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$BORI)],
                         c('#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$RESW13I)])
        colnames(topbar) <- colnames(eSet)
        rownames(topbar) <- c('BORI','RESW13I')
        topbar <- topbar[,colInd]
        d3Image(topbar,
                raw_values=NULL,
                show_xlabs = F,
                allow_NA = T,
                margins=list(top = 0,
                             right = right_mar,
                             bottom = 0,
                             left = 0))
    })

    output$left_dendrogram <- renderd3Dendrogram({
        d3Dendrogram(left_dend,
                     label = F,
                     axis = F,
                     horiz = T,
                     margins=list(top = 0,
                                  right = 5,
                                  bottom = bottom_mar,
                                  left = left_mar))
    })

    output$ExpressionMatrix <- renderd3Image({
        dat <- exprs(eSet)
        dat <- dat[rowInd,colInd]
        rm <- rowMeans(dat, na.rm = F)
        x <- sweep(dat, 1, rm)
        sx <- apply(x, 1, sd, na.rm = F)
        x <- sweep(x, 1, sx, "/")

        d3Image(data=x,
                raw_values=dat,
                xlab='Samples',
                ylab='genes',
                show_xlabs=T,
                show_ylabs=T,
                margins=list(top = 0,
                             right = right_mar,
                             bottom = bottom_mar,
                             left = 0)
        )
    })
}

shinyApp(ui, server)
