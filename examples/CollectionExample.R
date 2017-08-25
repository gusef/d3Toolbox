require(Biobase)
require(RColorBrewer)
require(d3Toolbox)

ui <- fillPage(fillRow(
  d3CollectionOutput("heatmap", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    d3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    d3ScatterOutput("lowdimpanel", width = "100%", height = "100%")
  ),flex = c(2,1))
  ,tags$head(tags$script(src="d3Collection.js"))
)


readeSet <- function(){
    eSet <- readRDS('/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/RNAseq_nodedup_cpm.RDS')
    eSet <- eSet[,eSet$Visit.Code == "SCREEN"]

    #fix genes
    genes <- as.character(read.csv('/Users/Daniel Gusenleitner/Dropbox (Personal)/Hephaestus/data/genes.txt')[,1])
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

    #make a data list
    data <- list()

    #color key
    data[[1]] <- list(type = 'd3Barplot',
                      data = rep(1,11),
                      show_axes = F,
                      padding = 0,
                      col=RColorBrewer::brewer.pal(11,"RdBu")[11:1],
                      margins=list(top = 40,
                                   right = 40,
                                   bottom = 40,
                                   left = 40))

    #top dendrogram
    data[[2]] <- list(type = 'd3Dendrogram',
                      data = top_dend,
                      label = F,
                      axis = F,
                      title = "First prototype of a heatmap",
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
    dat <- exprs(eSet)
    dat <- dat[rowInd,colInd]
    rm <- rowMeans(dat, na.rm = F)
    x <- sweep(dat, 1, rm)
    sx <- apply(x, 1, sd, na.rm = F)
    x <- sweep(x, 1, sx, "/")

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

    return(data)
}

server <- function(input, output, session) {

    values <- reactiveValues(data=readeSet())

    output$heatmap <- renderd3Collection({

        lmat <- matrix(c(1,NA,4,2,3,5),ncol=2)
        lwid <- c(3,10)
        lhei <- c(3,1,10)

        d3Collection(values$data,
                  lmat,
                  lwid,
                  lhei,
                  title='Second heatmap prototype')
    })

    output$filterpanel <- renderd3Barplot({
        data <- data.frame(x=(1:15),
                           y=(1:15)/2,
                           z=15:1)
        rownames(data) <- c(LETTERS[1:15])

        d3Barplot(data,
                  col=c('steelblue','grey','#de2d26'),
                  tooltip=c(paste0('letter_',LETTERS[1:15])),
                  xlab='Letters',
                  ylab='Frequencies',
                  title='New Barplot',
                  subtitle='with subtitle')
    })

    output$lowdimpanel <- renderd3Scatter({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)
        d3Scatter(data,
                  col=iris$Petal.Length,
                  dotsize = 3,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
                  title='Iris dataset',
                  subtitle='subtitle',
                  tooltip = c('Species'),
                  callback_handler='ScatterSelection')
    })

    output$currentOutput <- renderPrint({ print(input$ScatterSelection) })

}

shinyApp(ui, server)
