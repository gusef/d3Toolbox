require(Biobase)
require(RColorBrewer)
require(d3Toolbox)


ui <- fillPage(fillRow(
  #multi-panel
    d3ImageOutput("tSNE_panel", width = "100%", height = "100%"),
  fillCol(
    h3(verbatimTextOutput("currentOutput")),
    d3BarplotOutput("filterpanel", width = "100%", height = "100%"),
    d3ScatterOutput("lowdimpanel", width = "100%", height = "100%")
  ),flex = c(2,1))
  #,tags$head(tags$script(src="D3Image.js"))
)

server <- function(input, output, session) {
    #multidim panel
    output$lowdimpanel <- renderd3Scatter({
        data <- data.frame(x=iris$Sepal.Length,
                           y=iris$Sepal.Width,
                           z=iris$Petal.Length,
                           Species=iris$Species)
        rownames(data) <- paste0('Ex1_',1:nrow(data))

        legend <- data.frame(col=c('steelblue','orange','grey'),
                             name=levels(iris$Species))

        d3Scatter(data,
                  col=c('steelblue','orange','grey')[as.numeric(iris$Species)],
                  dotsize = 6,
                  xlab='Sepal Length',
                  ylab='Sepal Width',
                  title='Iris dataset',
                  subtitle='subtitle',
                  tooltip = c('Species','z'),
                  callback_handler='ScatterSelection')
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

    output$tSNE_panel <- renderd3Boxplot({
        x <- t(mtcars)
        rm <- rowMeans(x, na.rm = F)
        x <- sweep(x, 1, rm)
        sx <- apply(x, 1, sd, na.rm = F)
        x <- sweep(x, 1, sx, "/")

        d3Image(mat=x,
                xlab='Cars',
                ylab='Features',
                margins=list(top = 40,
                             right = 80,
                             bottom = 150,
                             left = 60),
                show_xlabs=T,
                show_ylabs=T,
                title='Motor Trend Car Road Tests',
                subtitle='mtcars dataset')
    })

    output$currentOutput <- renderPrint({ print(input$ImageSelection) })

}

shinyApp(ui, server)
