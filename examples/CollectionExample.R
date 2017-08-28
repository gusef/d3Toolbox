require(Biobase)
require(RColorBrewer)
require(d3Toolbox)
require(gplots)

ui <- fillPage(fillRow(
  d3CollectionOutput("heatmap", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    plotOutput("filterpanel", width = "100%", height = "100%")
  ),flex = c(2,1))
  ,tags$head(tags$script(src="d3-toolbox.js"))
  ,tags$head(tags$script(src="d3Collection.js"))
)


readeSet <- function(){
    dir <- '/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/'
    #dir <- '/Users/gusef/Dropbox (Personal)/Hephaestus/data/'

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

    right_mar <- 80
    bottom_mar <- 100
    left_mar <- 10

    dat <- exprs(eSet)
    dat <- dat[rowInd,colInd]
    rm <- rowMeans(dat, na.rm = F)
    x <- sweep(dat, 1, rm)
    sx <- apply(x, 1, sd, na.rm = F)
    x <- sweep(x, 1, sx, "/")


    #make a data list
    data <- list()

    #color key
    data[[1]] <- list(type = 'd3Colorkey',
                      data = x,
                      colscale=RColorBrewer::brewer.pal(11,"RdBu")[11:1])

    #top dendrogram
    data[[2]] <- list(type = 'd3Dendrogram',
                      data = top_dend,
                      label = F,
                      axis = F,
                      margins=list(top = 40,
                                   right = right_mar,
                                   bottom = 5,
                                   left = 0))

    #Color bar
    topbar <- rbind(c('#2ca25f','#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$BORI)],
                    c('#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$RESW13I)])
    colnames(topbar) <- colnames(eSet)
    rownames(topbar) <- c('BORI','RESW13I')
    topbar <- topbar[,colInd]
    data[[3]] <- list(type = 'd3Image',
                      data = topbar,
                      raw_values=NULL,
                      show_xlabs = F,
                      allow_NA = T,
                      margins=list(top = 0,
                                   right = right_mar,
                                   bottom = 0,
                                   left = 0))

    #left dendrogram
    data[[4]] <- list(type = 'd3Dendrogram',
                      data = left_dend,
                      label = F,
                      axis = F,
                      horiz = T,
                      margins=list(top = 0,
                                   right = 5,
                                   bottom = bottom_mar,
                                   left = left_mar))

    #expression matrix
    data[[5]] <- list(type = 'd3Image',
                      data=x,
                      raw_values=dat,
                      xlab='Samples',
                      ylab='genes',
                      show_xlabs=T,
                      show_ylabs=T,
                      margins=list(top = 0,
                                   right = right_mar,
                                   bottom = bottom_mar,
                                   left = 0))

    #legend
    data[[6]] <- list(type = 'd3Legend',
                      colors = c('#2ca25f','#f03b20','#99d8c9','#ffeda0')[c(1,3,4,2)],
                      text = levels(eSet$BORI)[c(1,3,4,2)],
                      title = 'RECIST')

    return(data)
}

server <- function(input, output, session) {

    values <- reactiveValues(data=readeSet())

    output$heatmap <- renderd3Collection({
        lmat <- matrix(c(1,NA,4,2,3,5,6,NA,NA),ncol=3)
        lwid <- c(3,10,3)
        lhei <- c(3,1,10)

        connectors <- list()
        connectors[[1]] <- data.frame(names=c(2,3,5),
                                      dims=c('value','column','column'))
        connectors[[2]] <- data.frame(names=c(4,5),
                                      dims=c('value','row'))

        d3Collection(values$data,
                      lmat,
                      lwid,
                      lhei,
                      connectors,
                      title='Second heatmap prototype')
    })

    output$filterpanel <- renderPlot({
        dir <- '/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/'
        #dir <- '/Users/gusef/Dropbox (Personal)/Hephaestus/data/'

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

        #left dendrogram
        hc01.row <- hcopt(as.dist(1-cor(t(exprs(eSet)))),method="ward.D")
        left_dend <- as.dendrogram(hc01.row)

        heatmap.2(x = exprs(eSet),
                  scale='row',
                  col = RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                  ColSideColors = c('#2ca25f','#f03b20','#99d8c9','#ffeda0')[as.numeric(eSet$BORI)],
                  Rowv = left_dend,
                  Colv = top_dend,
                  trace = 'none')
    })

    output$currentOutput <- renderPrint({ print(input$ScatterSelection) })

}

shinyApp(ui, server)
